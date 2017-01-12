module.exports = {
  _handleRequestSimulationBenchmark: _handleRequestSimulationBenchmark,
  _handleRequestEventUpdate: _handleRequestEventUpdate,
  getDistanceLatLonInKm: getDistanceLatLonInKm,
  deg2rad: deg2rad,
  getBenchmarks: getBenchmarks
};

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

function getBenchmarks(journeys, completionLogs) {
  const values = {};
  for (const log of completionLogs) {
    if (!values[log.frameworkID]) {
      values[log.frameworkID] = {totalTime: 0, totalDistance: 0, totalJourneyDistance: 0, mean: 0, variance: 0, slowest: 0, num: 0}
    }
    values[log.frameworkID].totalTime += log.duration;
    values[log.frameworkID].totalJourneyDistance += log.distance / 1000;

    const journey = journeys[log.journeyID];
    values[log.frameworkID].totalDistance += getDistanceLatLonInKm(journey.origin.lat, journey.origin.lng, journey.destination.lat, journey.destination.lng);
  }
  Object.keys(values).forEach(function(key, index) {
    if (values[key].totalTime == 0) {
      values[key].totalTime++;
    }
    values[key].totalTime /= 60 * 60;
    values[key].mean = values[key].totalDistance / values[key].totalTime;
  });

  for(const log of completionLogs) {
    const journey = journeys[log.journeyID];
    const distance = getDistanceLatLonInKm(journey.origin.lat, journey.origin.lng, journey.destination.lat, journey.destination.lng);
    const speed = distance / log.duration * 60 * 60;
    values[log.frameworkID].variance += Math.pow(speed - values[log.frameworkID].mean, 2);
    const slowest = values[log.frameworkID].slowest;
    values[log.frameworkID].slowest = !slowest || speed < slowest ? speed : slowest;
    values[log.frameworkID].num++;
  }

  return Object.keys(values).reduce(function(result, key) {
    values[key].variance /= values[key].num;
    console.log(values[key].totalJourneyDistance);
    result[key] = {
      completionSpeed: values[key].mean,
      completionSpeedVariance: values[key].variance,
      slowestJourney: values[key].slowest,
      totalTime: values[key].totalTime,
      averageTime: (values[key].totalTime * 60) / values[key].num,
      totalDistance: values[key].totalJourneyDistance,
      averageSpeed: values[key].totalJourneyDistance / values[key].totalTime
    };
    return result;
  }, {});
}

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
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
  console.log("Request benchmark for " + message.simulationID);
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

    let benchmarkValues = simulation.benchmarkValues;

    if (!message.doNotRecompute) {
      benchmarkValues = getBenchmarks(journeys, simulation.completionLogs);
      simulation.benchmarkValues = benchmarkValues

      simulation.save((error, simulation) => {
        if (error) {
          console.error(error);
        }
      });
    }

    connection.send(JSON.stringify({
      type: "simulation-benchmark",
      content: {
        value: benchmarkValues,
        simulationID: message.simulationID
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

      let latestTimestamp = simulation.latestTimestamp || 0;
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
const frameworkSocketServer = new WebSocketServer({ httpServer: fserver, maxReceivedFrameSize: 256 * 1024 });

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

      if (message.timeslice <= 0) {
        console.log('\t\tError');
        console.log('\t\tError');
        console.log('\t\tError');
        console.log('\t\tError');
      }

      if (message.timeslice < simulation.timeslice && simulation.latestTimestamp != undefined) {
        console.log("Was:");
        console.log(simulation.latestTimestamp);
        console.log(simulation.timeslice);
        simulation.simulationStates = createNewSimulationStates(simulation, message.timeslice);
        simulation.latestTimestamp = Math.floor(simulation.latestTimestamp / message.timeslice) * message.timeslice;
        simulation.timeslice = message.timeslice;
        console.log("Is:");
        console.log(simulation.latestTimestamp);
        console.log(simulation.timeslice);
        console.log(simulation.simulationStates[simulation.latestTimestamp/simulation.timeslice]);
        console.log(simulation.simulationStates[simulation.latestTimestamp/simulation.timeslice+1]);
      }

      let nextIndex = 0;
      if (simulation.latestTimestamp) {
        nextIndex = Math.ceil((simulation.latestTimestamp + simulation.timeslice) / simulation.timeslice)
      } else if (simulation.frameworks.length == 0) {
        simulation.timeslice = message.timeslice;
      }

      const startTimestamp = nextIndex * simulation.timeslice;
      simulation.frameworks.push({
        connectionIndex: frameworkConnections.length,
        name: message.name,
        timeslice: message.timeslice,
        startTimestamp: startTimestamp,
        nextTimestamp: startTimestamp
      });

      simulation.save((error, simulation) => {
        if (error || !simulation) {
          return console.error(error);
        }

        const frameworkIndex = simulation.frameworks.length - 1;
        const frameworkID = simulation.frameworks[frameworkIndex]._id;

        frameworkConnections.push({connection: connection, simulationID: simulation._id});

        const currIndex = Math.floor(simulation.latestTimestamp / simulation.timeslice);
        const state = simulation.simulationStates[currIndex] || [];

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
    console.log("Received simulation-update from framework");

    const simulationID = message.simulationID;
    const frameworkID = message.frameworkID;

    const newState = message;

    Simulation.findById(simulationID, function(error, simulation) {
      console.log('callback');
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

      for (const framework of simulation.frameworks) { //TODO: Figure better access method
        if (framework._id == frameworkID) {
          if (message.timestamp != framework.nextTimestamp) {
            console.log('\tError');
            console.log('\tError');
            console.log('\tError');
            console.log('\tError');
          }

          framework.nextTimestamp = message.timestamp + framework.timeslice;
          const nextIndex = Math.ceil(framework.nextTimestamp / simulation.timeslice);
          for (let i = simulationStateIndex; i < nextIndex; i++) {
            if (simulation.simulationStates.length == i) {
              simulation.simulationStates.push({
                communicated: false,
                timestamp: i * simulation.timeslice,
                participants: [],
                frameworkStates: [newState]
              });
            } else {
              simulation.simulationStates[i].frameworkStates.push(newState);
            }
          }
          simulation.simulationStates[simulationStateIndex].participants.push(frameworkID);
        }
      }

      const simulationState = simulation.simulationStates[simulationStateIndex];

      simulation.save((error, simulation) => {
        if (error || !simulation) {
          return console.error(error);
        }
        updateConnectionsWithState(simulation, simulationState);
        console.log("Updated simulationState");
      });
    });
  }

  function _handleJourneyComplete(message) {
    const log = {
      duration: message.timestamp - message.journeyStart,
      distance: message.journeyDistance,
      journeyID: message.journeyID,
      frameworkID: message.frameworkID
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
            case "framework-connect":
              _handleSimulationStart(messageContent);
              break;
            case "simulation-state-update":
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

        let min_timeslice = undefined;
        for (const framework of simulation.frameworks) {
          if (min_timeslice == undefined || framework.timeslice < min_timeslice) {
            min_timeslice = framework.timeslice;
          }
        }
        if (min_timeslice > simulation.timeslice) {
          console.log("Was:");
          console.log(simulation.latestTimestamp);
          console.log(simulation.timeslice);
          simulation.simulationStates = createNewSimulationStates(simulation, min_timeslice);
          simulation.latestTimestamp = Math.floor(simulation.latestTimestamp / min_timeslice) * min_timeslice;
          simulation.timeslice = min_timeslice;
          console.log("Is:");
          console.log(simulation.latestTimestamp);
          console.log(simulation.timeslice);
          console.log(simulation.simulationStates[simulation.latestTimestamp/simulation.timeslice]);
          console.log(simulation.simulationStates[simulation.latestTimestamp/simulation.timeslice+1]);
        }

        const nextIndex = Math.ceil((simulation.latestTimestamp + simulation.timeslice) / simulation.timeslice);
        const simulationState = simulation.simulationStates[nextIndex];
        if (simulationState) {
          updateConnectionsWithState(simulation, simulationState);
        }
      });
    }

    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

function createNewSimulationStates(simulation, newTimeslice) {
  const newSimulationStates = [];
  let newTimestamp = 0;
  for (const framework of simulation.frameworks) {
    const newStartIndex = Math.ceil(framework.startTimestamp / newTimeslice);
    let time = 0;
    if (newStartIndex <= newSimulationStates.length) {
      time = framework.startTimestamp;
    }
    while (time < framework.nextTimestamp) {
      const oldIndex = Math.ceil(time / simulation.timeslice);
      const simulationState = simulation.simulationStates[oldIndex];

      let frameworkState = undefined;
      for (const fState of simulationState.frameworkStates) {
        if (fState.frameworkID == framework._id) {
          frameworkState = fState;
          break;
        }
      }

      const newIndex = Math.ceil(time / newTimeslice);

      const nextTime = time + framework.timeslice;
      const nextNewIndex = Math.ceil(nextTime / newTimeslice);
      for (let i = newIndex; i < nextNewIndex; i++) {
        if (newSimulationStates.length == i) {
          const newFrameworkState = frameworkState ? [frameworkState] : [];
          const timestamp = i * newTimeslice;
          newSimulationStates.push({
            communicated: timestamp <= simulation.latestTimestamp,
            timestamp: timestamp,
            participants: [],
            frameworkStates: newFrameworkState
          });
        } else if (frameworkState) {
          newSimulationStates[i].frameworkStates.push(frameworkState);
        }
      }
      if (frameworkState && time > simulation.latestTimestamp) {
        newSimulationStates[newIndex].participants.push(framework._id);
      }
      time = nextTime;
    }
  }
  return newSimulationStates;
}

function updateConnectionsWithState(simulation, simulationState) {
  if (simulationState.frameworkStates.length >= simulation.frameworks.length) {
    if (!simulationState.communicated) {
      simulation.latestTimestamp = simulation.latestTimestamp + simulation.timeslice || 0; //message.timestamp; //TODO: this might not work for all cases
      simulationState.communicated = true;
      for (const framework of simulation.frameworks) {
        if (simulationState.participants.indexOf(framework._id) != -1) {
          const specifiedFrameworkStates = simulationState.frameworkStates.filter((frameworkState) => frameworkState.frameworkID != framework._id);
          frameworkConnections[framework.connectionIndex]['connection'].send(JSON.stringify({
            type: "simulation-communicate",
            content: specifiedFrameworkStates
          }))
        }
      }

      for (const frontend of simulation.frontends) {
        const index = frontend.connectionIndex;
        if (frontendConnections[index]['speed'] != undefined) {
          frontendConnections[index]['timestamp'] += frontendConnections[index]['speed'];
          if (frontendConnections[index]['timestamp'] > simulation.latestTimestamp) {
            frontendConnections[index]['timestamp'] = simulation.latestTimestamp;
          }
        } else {
          frontendConnections[index]['timestamp'] = simulation.latestTimestamp;
        }
        const stateIndex = Math.floor(frontendConnections[index]['timestamp'] / simulation.timeslice);
        const state = simulation.simulationStates[stateIndex];
        frontendConnections[index]['connection'].send(JSON.stringify({
          type: "simulation-state",
          content: {
            state: state,
            latestTimestamp: simulation.latestTimestamp
          }
        }))
      }
    }
  }
}

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
