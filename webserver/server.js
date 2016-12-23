const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const routes = require('./backend/routes/routes');
const session = require('express-session');
const config = require('./backend/config');
const passwordConfig = require('./backend/passport');
const fs = require('fs');
const uuidV4 = require('uuid/v4');
const jwt = require('jsonwebtoken');

const WebSocketServer = require('websocket').server;

const app = express();


const db = require('./backend/db');
const Journey = require('./backend/models/Journey');
const Simulation = require('./backend/models/Simulation');
const City = require('./backend/models/City');
const User = require('./backend/models/User');

Simulation.update({}, { $set: {frontends: [], frameworks: []}}, {multi: true}, function(err, numAffected) {
  if (err) {
    return;
  }
  console.log("Initial check successful");
});

function getDistanceLatLonInKm(lat1,lon1,lat2,lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);  // deg2rad below
  const dLon = deg2rad(lon2-lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function averageSpeedToDestination(journeys, completionLogs) {
  let totalTime = 0;
  let totalDistance = 0;

  for (const log of completionLogs) {
    totalTime += log.duration;

    const journey = journeys[log['journeyID']];
    totalDistance += getDistanceLatLonInKm(journey.origin.lat, journey.origin.lng, journey.destination.lat, journey.destination.lng);
  }
  if (totalTime == 0) {
    totalTime++;
  }
  return totalDistance / totalTime * 60 * 60;
}

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
// Use the session middleware
app.use(session({
  secret: config.token_secret,
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true
}));

// Catch unauthorised errors
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({
      "message": err.name + ": " + err.message
    });
  }
});

app.use('/', routes);

const server = app.listen(config.port, () => {
  const {address, port} = server.address();
  console.log(`The server is running at http://localhost:${port}/`);
});

const frontendConnections = []
const frameworkConnections = []

const frontendSocketServer = new WebSocketServer({ httpServer : server });

function _handleRequestSimulationBenchmark(message, connection) {
  console.log("Request benchmark");
  Simulation.findById(message.simulationID, function (error, simulation) {
    console.log("found simulation");
    if (error || !simulation) {
      connection.send(JSON.stringify({
        type: "simulation-error",
        content: {
          message: "Could not find simulation with ID " + message.simulationID
        }
      }));
      console.log("Could not find simulation with ID " + message.simulationID);
      return
    }
    const journeys = {};
    for (const journey of simulation.journeys) {
      journeys[journey._id] = journey;
    }
    //benchmarkValue = averageSpeedToDestination(journeys, simulation.simulationStates);
    benchmarkValue = averageSpeedToDestination(journeys, simulation.completionLogs);

    connection.send(JSON.stringify({
      type: "simulation-benchmark",
      content: {
        value: benchmarkValue
      }
    }));
  });
}

function _handleRequestEventUpdate(message, connection, callback) {
  const simulationID = message.simulationID;

  // We need to create Journey models so that the ids will be correctly assigned by mongoose
  const newJourneys = [];
  for (let journey of message.journeys) {
    newJourneys.push(new Journey({
      origin: journey.origin,
      destination: journey.destination
    }));
  }

  Simulation.findByIdAndUpdate(simulationID, {
    $push: {
      journeys: { $each: newJourneys }
    }
  }, {new: true}, function (error, simulation) {
    if (error || !simulation) {
      if (connection) {
        connection.send(JSON.stringify({
          type: "simulation-error",
          content: {
            message: "Could not find simulation with ID " + message.simulationID
          }
        }));
      }
      console.log("Could not find simulation with ID " + message.simulationID);
      console.error(error);
      callback(error);
      return
    }

    // Reassign the result so that the journeys include their ids
    message.journeys = newJourneys;

    for (const framework of simulation.frameworks) {
      frameworkConnections[framework.connectionIndex]['connection'].send(JSON.stringify({
        type: "simulation-update",
        content: message
      }));
    }

    for (const frontend of simulation.frontends) {
      frontendConnections[frontend.connectionIndex]['connection'].send(JSON.stringify({
        type: "simulation-journeys-update",
        content: {
          journeys: simulation.journeys
        }
      }))
    }

    callback(null, simulation);
  });
}

frontendSocketServer.on('request', function(request) {
  const connection = request.accept(null, request.origin);

  console.log((new Date()) + ' Frontend Connection accepted.');

  function _handleRequestAvailableCities() {
    City.find()
      .then((response) => {
        connection.send(JSON.stringify({
          type: "available-cities",
          content: response
        }));
      });
  }

  function _handleRequestDefaultObjectTypes() {
    // TODO Store defaults in db

    connection.send(JSON.stringify({
      type: "default-object-types",
      content: [{
        name: "Car",
        kindName: "vehicle",
        parameters: {
          "Average Speed": "50",
          "Top Speed": "120",
          "Length": "450",
          "Weight": "1355"
        }
      }]
    }));
  }

  function _handleRequestObjectKinds() {
    // TODO Store this in the db

    connection.send(JSON.stringify({
      type: "object-kind-info",
      content: [{
        name: "Vehicle",
        parameters: [
        {
          name: "Average Speed",
          kind: "text"
        },
        {
          name: "Top Speed",
          kind: "text"
        },
        {
          name: "Weight",
          kind: "text"
        },
        {
          name: "Length",
          kind: "text"
        }
        ]
      },
      {
        name: "Creature",
        parameters: [
        {
          name: "Type",
          kind: "predefined",
          allowedValues: ["unicorn", "dog"]
        }
        ]
      },
      {
        name: "Road Hazard",
        parameters: [
        {
          name: "Type",
          kind: "predefined",
          allowedValues: ["Shattered glass", "Traffic cone", "Ghost driver"]
        },
        {
          name: "Slowdown factor",
          kind: "text"
        }
        ]
      }]
    }));
  }

  function _calculatePopularityAtTime(hotspot, date) {
    const levels = hotspot.popularityLevels;

    for (var i = 0; i < levels.length; i++) {
      const startTime = levels[i].startTime.split(':');
      const endTime = levels[i].endTime.split(':');

      let startDate = new Date(date.getTime());
      startDate.setHours(startTime[0]);
      startDate.setMinutes(startTime[1]);
      startDate.setSeconds(startTime[2]);

      let endDate = new Date(date.getTime());
      endDate.setHours(endTime[0]);
      endDate.setMinutes(endTime[1]);
      endDate.setSeconds(endTime[2]);

      if (date >= startDate && date <= endDate) { //TODO: Sort levels by date to allow for binary search
        return levels[i].level;
      }
    }
  }

  function _generatePoint(hotspotCoords, maxDistance, bounds) {
    const lng_scale = 111.319;
    const lat_scale = 110.54

    const distanceFromHotspot = Math.random() * maxDistance; //TODO: Change from uniform distribution to more meaningful one
    const angle = Math.random() * Math.PI * 2;

    const horizontal = distanceFromHotspot * Math.cos(angle);
    const vertical = distanceFromHotspot * Math.sin(angle);

    const latChange = horizontal/lat_scale;
    const lngChange = vertical/(lng_scale * Math.cos(hotspotCoords.lat));

    const point = {
      lat: hotspotCoords.lat + latChange,
      lng: hotspotCoords.lng + lngChange
    };
    //check point in bbox
    if (bounds.southWest.lat <= point.lat && point.lat <= bounds.northEast.lat &&
        bounds.southWest.lng <= point.lng && point.lng <= bounds.northEast.lng) {
      return point;
    }
    return _generatePoint(hotspotCoords, maxDistance, bounds);
  }

  function _createAccurateJourney(hotspots, bounds, startTime) {
    let popularitySum = 0;
    for (const hotspot of hotspots) {
      popularitySum += _calculatePopularityAtTime(hotspot, startTime)
    }

    const lookupVal = Math.random() * popularitySum;
    let hotspotsClone = hotspots.slice();

    let rollingSum = 0;
    let startHotspot;
    let remainingPopularitySum = popularitySum;
    for (const i in hotspotsClone) {
      const popularity = _calculatePopularityAtTime(hotspotsClone[i], startTime);
      rollingSum += popularity;
      if (rollingSum >= lookupVal) {
        startHotspot = hotspotsClone[i];
        hotspotsClone.splice(i, 1);
        remainingPopularitySum -= popularity;
        break;
      }
    }

    //TODO: Replace this with a better method of generating the end hotspot that is dependant on the start position.
    const endPointLookupVal = Math.random() * remainingPopularitySum;
    rollingSum = 0;
    let endHotspot;
    for (var i = 0; i < hotspotsClone.length; i++) {
      rollingSum += _calculatePopularityAtTime(hotspotsClone[i], startTime);
      if (rollingSum >= endPointLookupVal) {
        endHotspot = hotspotsClone[i];
        break;
      }
    }

    const maxDistance = 0.8; //km //TODO: Make better model
    const startCoords = _generatePoint(startHotspot.coordinates, maxDistance, bounds);
    const endCoords   = _generatePoint(endHotspot.coordinates, maxDistance, bounds);


    const journey = {
      carID: '0',
      origin: startCoords,
      destination: endCoords
    };

    return journey;
  }

  function _createSimulationWithRealData(data, callback) {
    const bounds = data.selectedCity.bounds;
    const journeyNum = data.realWorldJourneyNum;
    const startTime = new Date(); //TODO: Use epoch time instead of silly string manipulations //TODO: Base off of simulation timestamp

    //TODO: change to generic hotspot file. This step should be preprocessed.
    fs.readFile('../uploads/hotspots.json', 'utf8', function (err, json) {
      if (err) {
        return console.error(err);
      }

      const hotspotData = (JSON.parse(json));
      let hotspots = [];

      for (const i in hotspotData) {
        if (bounds.southWest.lat <= hotspotData[i].coordinates.lat && hotspotData[i].coordinates.lat <= bounds.northEast.lat &&
            bounds.southWest.lng <= hotspotData[i].coordinates.lng && hotspotData[i].coordinates.lng <= bounds.northEast.lng) {
          hotspots.push(hotspotData[i]);
        }
      }

      var journeys = [];
      for (var i = 0; i < journeyNum; i++) {
        journeys.push(_createAccurateJourney(hotspots, bounds, startTime));
      }
      journeys = journeys.concat(data.journeys);

      simulationData = {
        city: data.selectedCity,
        createdAt: Date.now(),
        latestTimestamp: 0,
        hotspots: hotspots,
        journeys: journeys,
        frontends: [{connectionIndex: frontendConnections.length}],
        completionLogs: [],
        frameworks: [],
        simulationStates: []
      };
      _createSimulation(simulationData, data.userID, callback)
    });
  }

  function _createSimulation(simulationData, userID, callback) {
    simulation = new Simulation(simulationData);
    simulation.save((error, simulation) => {
      if (error) {
        return console.error(error);
      }
      const updateInfo = {
        $push: {
          simulations: simulation._id
        },
        $set: {
          active_simulation: simulation._id
        }
      };
      const options = {
        upsert: true
      };
      User.findOneAndUpdate({
        _id: userID
      }, updateInfo, options)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });
      frontendConnections.push({connection: connection, simulationID: simulation._id, timestamp: 0, speed: null});
    });

    callback(null, simulation._id, simulationData.city._id, simulation.journeys);
  }

  function _handleRequestSimulationStart(message, callback) {
    if (message.useRealData) { //TODO: Fix bad refactoring
      _createSimulationWithRealData(message, callback)
    } else {
      const simulationData = {
        city: message.selectedCity,
        createdAt: Date.now(),
        latestTimestamp: 0,
        journeys: message.journeys,
        frontends: [{connectionIndex: frontendConnections.length}],
        completionLogs: [],
        frameworks: [],
        simulationStates: []
      };
      _createSimulation(simulationData, message.userID, callback);
    }
  }

  function _handleRequestSimulationJoin(message) {
    const simulationID = message.simulationID;
    Simulation.findByIdAndUpdate(simulationID, {
      $push: {
        frontends: {
          connectionIndex: frontendConnections.length
        }
      }
    }, { new: true }, function (error, simulation) {
      if (error || !simulation) {
        connection.send(JSON.stringify({
          type: "simulation-error",
          content: {
            message: "Could not find simulation with ID " + simulationID
          }
        }));
        console.log("Could not find simulation with ID " + simulationID);
        return;
      }
      const numStates = simulation.simulationStates.length;
      let latestTimestamp = 0;
      if (numStates > 0) {
        latestTimestamp = simulation.simulationStates[numStates-1]['timestamp'];
      }
      frontendConnections.push({connection: connection, simulationID: simulationID, timestamp: latestTimestamp, speed: null});

      City.findOne({name: simulation.city.name}, (error, city) => {
        if (error || !city) {
          console.error("Error when trying to retrieve city ID");
          console.error(error);
          return;
        }

        connection.send(JSON.stringify({
          type: "simulation-start-parameters",
          content: {
            simID: simulationID,
            cityID: city._id,
            journeys: simulation.journeys
          }
        }));
      })
      sendFrameworkList(simulation, connection);
    })
  }

  function _handleRequestSimulationSpeedChange(message) {
    const index = lookup(frontendConnections, function(obj) {
      return obj['connection'] == connection;
    });

    if (index >= 0) {
      frontendConnections[index]['speed'] = message.simulationSpeed;
    }
  }

  function _handleRequestSimulationTimestampChange(message) {
    const index = lookup(frontendConnections, function(obj) {
      return obj['connection'] == connection;
    });

    if (index >= 0) {
      Simulation.findById(message.simulationID, function (error, simulation) {
        if (error || !simulation) {
          connection.send(JSON.stringify({
            type: "simulation-error",
            content: {
              message: "Could not find simulation with ID " + message.simulationID
            }
          }));
          console.log("Could not find simulation with ID " + message.simulationID);
          return
        }

        frontendConnections[index]['timestamp'] = message.timestamp;
        const stateIndex = Math.floor(frontendConnections[index]['timestamp'] / simulation.timeslice);
        frontendConnections[index]['connection'].send(JSON.stringify({
          type: "simulation-state",
          content: {
            state: simulation.simulationStates[stateIndex]
          }
        }))
      });
    }
  }

  function _handleRequestSimulationDisconnectFrameworks(message) {
    Simulation.findById(message.simulationID, function (error, simulation) {
      if (error || !simulation) {
        connection.send(JSON.stringify({
          type: "simulation-error",
          content: {
            message: "Could not find simulation with ID " + message.simulationID
          }
        }));
        console.log("Could not find simulation with ID " + message.simulationID);
        return
      }

      for (const framework of simulation.frameworks) {
        frameworkConnections[framework.connectionIndex]['connection'].send(JSON.stringify({
          type: "framework-disconnect",
          content: message
        }));
      }
    });
  }

  function _handleRequestAPIAccess(message) {
    console.log("Request API access");
    const userID = message.userID;
    User.findById(userID, function (error, user) {
      if (error || !user) {
        err = error ? error : "User not found"
          connection.send(JSON.stringify({
            type: "user-error",
            content: {
              error: err
            }
          }));
      }
      const id  = uuidV4();
      const key = uuidV4();
      user.setAPIAccess(id, key);
      user.save( (err) => {
        connection.send(JSON.stringify({
          type: "user-api-access",
          content: {
            api_id: id,
            api_key: key
          }
        }));
      });
    });
  }




  function _handleRequestFrameworkDisconnect(message) {
    const index = message.connectionIndex;
    const simulationID = message.simulationID;
    console.log(index);

    frameworkConnections[index]['connection'].send(JSON.stringify({
      type: "framework-disconnect",
      content: {}
    }));
  }

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      const messageData = JSON.parse(message.utf8Data);
      const messageContent = messageData.content;

      switch (messageData.type) {
        case "request-available-cities":
          _handleRequestAvailableCities();
          break;
        case "request-default-object-types":
          _handleRequestDefaultObjectTypes();
          break;
        case "request-object-kind-info":
          _handleRequestObjectKinds();
          break;
        case "request-simulation-start":
          _handleRequestSimulationStart(messageContent, (err, simID, cityID, journeys) => {
            connection.send(JSON.stringify({
              type: "simulation-id",
              content: {
                simulationInfo: {
                  id: simID,
                  cityID: cityID
                },
                journeys: journeys
              }
            }));
          });
          break;
        case "request-simulation-join":
          _handleRequestSimulationJoin(messageContent);
          break;
        case "request-simulation-update":
          _handleRequestEventUpdate(messageContent, connection, () => {});
          break;
        case "request-simulation-speed-change":
          _handleRequestSimulationSpeedChange(messageContent);
          break;
        case "request-simulation-timestamp-change":
          _handleRequestSimulationTimestampChange(messageContent);
          break;
        case "request-simulation-disconnect-frameworks":
          _handleRequestSimulationDisconnectFrameworks(messageContent);
          break;
        case "request-simulation-benchmark":
          _handleRequestSimulationBenchmark(messageContent, connection);
          break;
        case "request-user-api-access":
          _handleRequestAPIAccess(messageContent);
          break;
        case "request-framework-disconnect":
          _handleRequestFrameworkDisconnect(messageContent);
          break;
      }
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });

  connection.on('close', function(reasonCode, description) {
    const index = lookup(frontendConnections, function(obj) {
      return obj['connection'] == connection;
    });

    if (index >= 0) {
      const simulationID = frontendConnections[index]['simulationID'];
      delete frontendConnections[index];

      Simulation.update({_id: simulationID}, { $pull: { frontends: { connectionIndex: index }}}, function (error, numAffected) {
        if (error || !numAffected) {
          console.log("Could not find corresponding simulation for connection");
          return
        }
      });

      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    }
  });
});

const fserver = require('http').createServer();
const frameworkSocketServer = new WebSocketServer({ httpServer: fserver });

frameworkSocketServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

  console.log((new Date()) + ' Connection accepted.');

  function _handleSimulationStart(message) {
    console.log("Received simulation-start from framework");

    const simulationID = message.simulationID;

    Simulation.findById(simulationID, function(error, simulation) {
      if (error || !simulation) {
        console.error(error);
        connection.send(JSON.stringify({
          type: "simulation-error",
          content: {
            message: "Could not find simulation with ID " + simulationID
          }
        }));
        console.log("Could not find simulation with ID " + simulationID);
        return
      }

      if (message.timeslice < simulation.timeslice) {
        const newSimulationStates = [];
        const expectedTimestamp = simulation.latestTimestamp + simulation.timeslice;
        let newTimestamp = 0;
        for (const i = 0; i < simulation.simulationStates.length && newTimestamp < expectedTimestamp; i++) {
          while (newTimestamp < (i + 1) * simulation.timeslice) {
            newSimulationStates.push(simulation.simulationStates[i]);
            newTimestamp += message.timeslice;
          }
        }
        simulation.timeslice = message.timeslice;
        simulation.simulationStates = newSimulationStates;

        const nextIndex = Math.ceil(expectedTimestamp / message.timeslice);
        if (nextIndex * simulation.timeslice != newTimestamp) {
          console.log('\t\tError');
          console.log('\t\tError');
          console.log('\t\tError');
          console.log('\t\tError');
          console.log('\t\tError');
          console.log('\t\tError');
          console.log('\t\tError');
          console.log('\t\tError');
        }
        simulation.latestTimestamp = newTimestamp - simulation.timeslice; //TODO: Not coherent tracking of information
      }

      simulation.frameworks.push({
        connectionIndex: frameworkConnections.length,
        timeslice: message.timeslice,
        nextIndex: Math.ceil((simulation.latestTimestamp + simulation.timeslice) / simulation.timeslice)
      });

      simulation.save((error, simulation) => {
        if (error || !simulation) {
          return console.error(error);
        }

        const frameworkIndex = simulation.frameworks.length - 1;
        const frameworkID = simulation.frameworks[frameworkIndex]._id;

        frameworkConnections.push({connection: connection, simulationID: simulation._id});

        const numStates = simulation.simulationStates.length;
        const currIndex = Math.floor(simulation.latestTimestamp / simulation.timeslice);
        const state = (numStates > 0) ? simulation.simulationStates[currIndex] : [];

        const startTimestamp = simulation.frameworks[frameworkIndex].nextIndex * simulation.timeslice;

        connection.send(JSON.stringify({
          type: "simulation-start-parameters",
          content: {
            frameworkID: frameworkID,
            city: simulation.city,
            journeys: simulation.journeys,
            timestamp: startTimestamp,
            state: state
          }
        }));
        sendFrameworkList(simulation);
      });
    })
  }

  function _handleSimulationStateUpdate(message) {
    function _filterState(state, frameworkID) {
      const objects = state.objects.filter((object, index) => {
        if (object.frameworkID == undefined) {
          // If the object hasn't been set with a frameworkID, set it to the ID of
          // the framework which sent it.
          state.objects[index] = frameworkID;
          return true;
        } else if (object.frameworkID == frameworkID) {
          return true;
        } else {
          console.log("Framework with ID "+ frameworkID + " tried to update a simulation object it doesn't own");
          return false;
        }
      })

      state.objects = objects;
      return state;
    }

    console.log("Received simulation-update from framework");
    //console.log(message);

    const simulationID = message.simulationID;
    const frameworkID = message.frameworkID;

    //const newState = _filterState(message, frameworkID); TODO: Check if works
    const newState = message;

    Simulation.findById(simulationID, function(error, simulation) {
      if (error || !simulation) {
        connection.send(JSON.stringify({
          type: "simulation-error",
          content: {
            message: "Could not find simulation with ID " + simulationID
          }
        }))
        console.log("Could not find simulation with ID " + simulationID);
        return
      }

      const simulationStateIndex = Math.ceil(message.timestamp / simulation.timeslice);

      for (const j in simulation.frameworks) { //TODO: Figure better access method //TODO: Revert to 'of'
        const framework = simulation.frameworks[j];
        if (framework._id == frameworkID) {
          if (simulationStateIndex != framework.nextIndex) {
            console.log('\tError');
            console.log('\tError');
            console.log('\tError');
            console.log('\tError');
          }

          const nextIndex = Math.ceil((message.timestamp + framework.timeslice) / simulation.timeslice);
          for (const i = simulationStateIndex; i < nextIndex; i++) {
            if (simulation.simulationStates.length == i) {
              simulation.simulationStates.push({
                communicated: false,
                timestamp: nearTimestamp,
                formattedTimestamp: message.formattedTimestamp,
                id: message.id,
                frameworkstates: [newState]
              });
            } else {
              simulation.simulationStates[i].frameworkStates.push(newState);
            }
          }
          framework.nextIndex = nextIndex;
          console.log('\t\tTest: ' + simulation.frameworks[j].nextIndex);
        }
      }

      const simulationState = simulation.simulationStates[simulationStateIndex];
      if (simulationState.frameworkStates.length >= simulation.frameworks.length) {
        if (simulationState.communicated) {
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');
          console.log('\tError');

          const specifiedSimulationState = simulation.simulationStates[simulationStateIndex].frameworkStates.filter((frameworkState) => frameworkState.frameworkID != newState.frameworkID);
          connection.send(JSON.stringify({
            type: "simulation-communicate",
            content: specifiedSimulationState
          }))
        }
        else {
          simulation.latestTimestamp += simulation.timeslice;
          simulationState.communicated = true;
          console.log('\t\tCheck: ' + simulation.simulationStates[simulationStateIndex].communicated);
          for (const framework of simulation.frameworks) {
            const specifiedSimulationState = latestFrameworkStates.filter((frameworkState) => frameworkState.frameworkID != framework._id);
            frameworkConnections[framework.connectionIndex]['connection'].send(JSON.stringify({
              type: "simulation-communicate",
              content: specifiedSimulationState
            }))
          }

          for (const frontend of simulation.frontends) {
            const index = frontend.connectionIndex;
            if (frontendConnections[index]['speed'] != undefined) {
              frontendConnections[index]['timestamp'] += frontendConnections[index]['speed'];
              if (frontendConnections[index]['timestamp'] > message.timestamp) {
                frontendConnections[index]['timestamp'] = message.timestamp;
              }
            } else {
              frontendConnections[index]['timestamp'] = message.timestamp;
            }
            const stateIndex = Math.floor(frontendConnections[index]['timestamp'] / simulation.timeslice);
            const state = simulation.simulationStates[stateIndex];
            frontendConnections[index]['connection'].send(JSON.stringify({
              type: "simulation-state",
              content: {
                state: state,
                latestTimestamp: message.timestamp
              }
            }))
          }
        }
      }

      simulation.save((error, simulation) => {
        if (error || !simulation) {
          return console.error(error);
        }
        console.log("Updated simulationState");
      });
    });
  }

  function _handleJourneyComplete(message) {
    const log = {
      duration: message.timestamp - message.journeyStart,
      journeyID: message.journeyID
    };
    console.log(message);
    console.log("Logging " + message.simulationID);
    Simulation.update({_id: message.simulationID}, {$push: { completionLogs: log}}, function (error, numAffected) {
      if (error || !numAffected) {
        console.log("Could not find corresponding simulation for connection");
        return
      }
    });
  }

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      const messageData = JSON.parse(message.utf8Data);
      const messageContent = messageData.content;
      const token = messageData.token
      jwt.verify(token, config.token_secret, function(err, decoded) {
        if (err) { return err; }
        if (messageContent.simulationID === decoded.sid) {
          console.log("Received valid JSON packet from:" + decoded.cip);
          switch(messageData.type) {
            case "simulation-start":
              _handleSimulationStart(messageContent);
              break;
            case "simulation-state":
              _handleSimulationStateUpdate(messageContent);
              break;
            case "simulation-journey-complete":
              _handleJourneyComplete(messageContent);
          }
        }
      });
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });

  connection.on('close', function(reasonCode, description) {
    const index = lookup(frameworkConnections, function(obj) {
      return obj['connection'] == connection;
    });

    if (index >= 0) {
      const simulationID = frameworkConnections[index]['simulationID'];
      delete frameworkConnections[index];

      Simulation.findByIdAndUpdate(simulationID, { $pull: { frameworks: { connectionIndex: index }}}, {new: true}, function (error, simulation) {
        if (error || !simulation) {
          console.log("Could not find corresponding simulation for connection");
          return
        }
        sendFrameworkList(simulation);
      });
    }

    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

function sendFrameworkList(simulation, connection) {
  const packet = {
    type: "simulation-frameworks",
    content: {
      frameworks: simulation.frameworks
    }
  };
  if (connection) {
    connection.send(JSON.stringify(packet));
  } else {
    for (const frontend of simulation.frontends) {
      frontendConnections[frontend.connectionIndex]['connection'].send(JSON.stringify(packet));
    }
  }
}

function lookup(objs, eqF) {
  for (const i in objs) {
    if (eqF(objs[i])) {
      return i;
    }
  }
  return -1;
}

fserver.listen(9000);

module.exports = {
  _handleRequestSimulationBenchmark: _handleRequestSimulationBenchmark,
  _handleRequestEventUpdate: _handleRequestEventUpdate,
  getDistanceLatLonInKm: getDistanceLatLonInKm,
  deg2rad: deg2rad,
  averageSpeedToDestination: averageSpeedToDestination,
  address: server.address(),
};
