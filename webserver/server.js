const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
exports._handleRequestEventUpdate = _handleRequestEventUpdate;
const routes = require('./backend/routes/routes');
const session = require('express-session');
const config = require('./backend/config');
const passwordConfig = require('./backend/passport');
const fs = require('fs');

const WebSocketServer = require('websocket').server;

const app = express();


const db = require('./backend/db');
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
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function averageSpeedToDestination(journeys, states) {
  let carsOnTheRoad = {};
  let totalTime = 0;
  let totalDistance = 0;
  for (let state of states) {
    for (let obj of state.objects) {
      if (obj.id in carsOnTheRoad) {
        const journey = journeys[obj.id];
        dest = journey.destination;
        pos = obj.position;
        if (pos.lat == dest.lat && pos.lng == dest.lng) {
          totalTime += state.timestamp - carOnTheRoad[obj.id].departure;
					totalDistance += getDistanceLatLonInKm(journey.origin.lat
 																								,journey.origin.lng
																								,journey.destination.lat
																								,journey.destination.lng);
      	}
      } else {
        carsOnTheRoad[obj.id] = { departure: state.timestamp, origin: obj.position}
      }
    }
  }
  if (totalTime == 0) {
    totalTime++;
  }
  return totalDistance / totalTime;
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

function _handleRequestEventUpdate(message, callback) {
  const simulationID = message.content.simulationID;
  Simulation.findByIdAndUpdate(simulationID, {
    $push: {
      journeys: { $each: message.content.journeys }
    }
  }, {new: true}, function (error, simulation) {
    if (error || !simulation) {
      connection.send(JSON.stringify({
        type: "simulation-error",
        content: {
          message: "Could not find simulation with ID " + message.content.simulationID
        }
      }));
      console.log("Could not find simulation with ID " + message.content.simulationID);
      console.error(error);
      callback(error);
      return
    }

    for (const framework of simulation.frameworks) {
      frameworkConnections[framework.connectionIndex]['connection'].send(JSON.stringify({
        type: "simulation-update",
        content: message.content
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
    }))
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



      if (date >= startDate && date <= endDate) {
        return levels[i].level;
      }
    }
  }

  function _createAccurateJourney(hotspotInfo, startTime) {
    const lookupVal = Math.random() * hotspotInfo.popularitySum;
    let hotspots = hotspotInfo.hotspots.slice();

    let rollingSum = 0;
    let startHotspot;
    let remainingPopularitySum = hotspotInfo.popularitySum;
    for (var i = 0; i < hotspots.length; i++) {
      const popularity = _calculatePopularityAtTime(hotspots[i], startTime);
      rollingSum+= popularity;
      if (rollingSum >= lookupVal) {
        startHotspot = hotspots[i];
        hotspots.splice(i, 1);
        remainingPopularitySum -= popularity;
        break;
      }
    }

    //TODO: Replace this with a better method of generating the end hotspot that is dependant on the start position.
    const endPointLookupVal = Math.random() * remainingPopularitySum;
    rollingSum = 0;
    let endHotspot;
    for (var i = 0; i < hotspots.length; i++) {
      rollingSum += _calculatePopularityAtTime(hotspots[i], startTime);
      if (rollingSum >= endPointLookupVal) {
        endHotspot = hotspots[i];
        break;
      }
    }

    //TODO: Distribute points around hotspot rather than starting at a hotspot.
    //const maxDistance = 0.8 //km
    //const distanceFromHotspot = Math.Random() * maxDistance;

    const journey = {
      carID: '0',
      origin: startHotspot.coordinates,
      destination: endHotspot.coordinates
    }

    return journey;
  }

  function _createSimulationWithRealData(data, callback) {
    const bounds = data.selectedCity.bounds;
    const journeyNum = data.realWorldJourneyNum;
    const startTime = new Date();
    fs.readFile('./public/data/LondonUndergroundInfo.json', 'utf8', function (err, json) {
      if (err) {
        return console.error(err);
      }

      const undergroundData = (JSON.parse(json));
      let hotspots = [];
      let popularitySum = 0;
      for (var i = 0; i < undergroundData.length; i++) {
        if (bounds.southWest.lat <= undergroundData[i].lat && undergroundData[i].lat <= bounds.northEast.lat &&
            bounds.southWest.lng <= undergroundData[i].lng && undergroundData[i].lng <= bounds.northEast.lng) {
          const hotspot = {
            name: undergroundData[i].stationName,
            coordinates: {
              lat: undergroundData[i].lat,
              lng: undergroundData[i].lng
            },
            popularityLevels: [{
              startTime: "00:00:00",
              endTime: "23:59:59",
              level: undergroundData[i].entryPlusExitInMillions,
            }]
          };
          popularitySum += _calculatePopularityAtTime(hotspot, startTime);
          hotspots.push(hotspot);
        }
      }
      const hotspotInfo = {
        hotspots: hotspots,
        popularitySum: popularitySum
      };


      var journeys = [];
      for (var i = 0; i <journeyNum; i++) {
        journeys.push(_createAccurateJourney(hotspotInfo, startTime))
      }
      journeys = journeys.concat(data.journeys)

      simulation = new Simulation({
        city: data.selectedCity,
        hotspotInfo: hotspotInfo,
        journeys: journeys,
        frontends: [{connectionIndex: frontendConnections.length}],
        frameworks: [],
        simulationStates: []
      });

      simulation.save((error, simulation) => {
        if (error) {
          return console.error(error);
        }
        frontendConnections.push({
          connection: connection,
          simulationID: simulation._id,
          timestamp: 0,
          speed: null
        });
      });
      callback(null, simulation._id, data.selectedCity._id, data.journeys);
    });
  }

  function _handleRequestSimulationStart(message, callback) {
    const data = message.content;
    if (data.useRealData) {
      _createSimulationWithRealData(data, callback)
    } else {
      const simulation = new Simulation({
        city: data.selectedCity,
        journeys: data.journeys,
        frontends: [{connectionIndex: frontendConnections.length}],
        frameworks: [],
        simulationStates: []
      });

    simulation.save((error, simulation) => {
      if (error) {
        return console.error(error);
      }
      const updateInfo = {
        $push: {
          simulations: simulation._id
        }
      };
      const options = {
        upsert: true
      };
      User.findOneAndUpdate({
          _id: data.userID
        }, updateInfo, options)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });
      frontendConnections.push({connection: connection, simulationID: simulation._id, timestamp: 0, speed: null});
    });

    callback(null, simulation._id, data.selectedCity._id, simulation.journeys);
    }
  }

  function _handleRequestSimulationJoin(message) {
    const simulationID = message.content.simulationID;
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
    })
  }

  function _handleRequestSimulationSpeedChange(message) {
    const index = lookup(frontendConnections, function(obj) {
      return obj['connection'] == connection;
    });

    if (index >= 0) {
      frontendConnections[index]['speed'] = message.content.simulationSpeed;
    }
  }

  function _handleRequestSimulationTimestampChange(message) {
    const index = lookup(frontendConnections, function(obj) {
      return obj['connection'] == connection;
    });

    if (index >= 0) {
      Simulation.findById(message.content.simulationID, function (error, simulation) {
        if (error || !simulation) {
          connection.send(JSON.stringify({
            type: "simulation-error",
            content: {
              message: "Could not find simulation with ID " + message.content.simulationID
            }
          }));
          console.log("Could not find simulation with ID " + message.content.simulationID);
          return
        }

        frontendConnections[index]['timestamp'] = message.content.timestamp;
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

  function _handleRequestSimulationClose(message) {
    Simulation.findById(message.content.simulationID, function (error, simulation) {
      if (error || !simulation) {
        connection.send(JSON.stringify({
          type: "simulation-error",
          content: {
            message: "Could not find simulation with ID " + message.content.simulationID
          }
        }));
        console.log("Could not find simulation with ID " + message.content.simulationID);
        return
      }

      for (const framework of simulation.frameworks) {
        frameworkConnections[framework.connectionIndex]['connection'].send(JSON.stringify({
          type: "simulation-close",
          content: message.content
        }));
      }
    });
  }

  function _handleRequestSimulationBenchmark(message) {
    Simulation.findById(message.content.simulationID, function (error, simulation) {
      if (error || !simulation) {
        connection.send(JSON.stringify({
          type: "simulation-error",
          content: {
            message: "Could not find simulation with ID " + message.content.simulationID
          }
        }));
        console.log("Could not find simulation with ID " + message.content.simulationID);
        return
      }
    	benchmarkValue = averageSpeedToDestination(simulation.journeys
                                          		  ,simulation.simulationStates);

        connection.send(JSON.stringify({
        type: "simulation-benchmark",
        content: {
          value: benchmarkValue
        }
      }))
    });
  }

  connection.on('message', function(message) {
    if (message.type === 'utf8') {

      const messageData = JSON.parse(message.utf8Data);

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
          _handleRequestSimulationStart(messageData, (err, simID, cityID, journeys) => {
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
          _handleRequestSimulationJoin(messageData);
          break;
        case "request-simulation-update":
          _handleRequestEventUpdate(messageData);
          break;
        case "request-simulation-speed-change":
          _handleRequestSimulationSpeedChange(messageData);
          break;
        case "request-simulation-timestamp-change":
          _handleRequestSimulationTimestampChange(messageData);
          break;
        case "request-simulation-close":
          _handleRequestSimulationClose(messageData);
          break;
        case "request-simulation-benchmark":
          _handleRequestSimulationBenchmark(messageData);
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

    const simulationID = message.content.simulationID;

    Simulation.findByIdAndUpdate(simulationID, {
      $set: {
        timeslice: message.content.timeslice,
        simulationStates: []
      },
      $push: {
        frameworks: {
          connectionIndex: frameworkConnections.length
        }
      }
    }, { new: true }, function (error, simulation) {
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

      const frameworkIndex = simulation.frameworks.length - 1;
      const frameworkID = simulation.frameworks[frameworkIndex]._id;

      frameworkConnections.push({connection: connection, simulationID: simulation._id});

      for (const frontend of simulation.frontends) {
        frontendConnections[frontend.connectionIndex]['timestamp'] = 0;
      }

      connection.send(JSON.stringify({
        type: "simulation-start-parameters",
        content: {
          frameworkID: frameworkID,
          city: simulation.city,
          journeys: simulation.journeys
        }
      }));
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

    const simulationID = message.content.simulationID;
    const frameworkID = message.content.frameworkID;

    const newState = _filterState(message.content, frameworkID);

    Simulation.findByIdAndUpdate(simulationID, { $push: { simulationStates: newState } }, { new: true }, function (error, simulation) {
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

      console.log("Updated simulationState");

      for (const framework of simulation.frameworks) {
        if (connection != frameworkConnections[framework.connectionIndex]['connection']) {
          frameworkConnections[framework.connectionIndex]['connection'].send(JSON.stringify({
            type: "simulation-communicate",
            content: message.content
          }))
        }
      }
      for (const frontend of simulation.frontends) {
        const index = frontend.connectionIndex;
        if (frontendConnections[index]['speed'] != undefined) {
          frontendConnections[index]['timestamp'] += frontendConnections[index]['speed']
          if (frontendConnections[index]['timestamp'] > message.content.timestamp) {
            frontendConnections[index]['timestamp'] = message.content.timestamp;
          }
        } else {
          frontendConnections[index]['timestamp'] = message.content.timestamp;
        }
        const stateIndex = Math.floor(frontendConnections[index]['timestamp'] / simulation.timeslice);
        const state = simulation.simulationStates[stateIndex];
        frontendConnections[index]['connection'].send(JSON.stringify({
          type: "simulation-state",
          content: {
            state: state,
            latestTimestamp: message.content.timestamp
          }
        }))
      }
    });
  }

  function _handleSimulationClose(message) {
    console.log("Received close confirmation from framework");

    const simulationID = message.content.simulationID;

    Simulation.findOne({
      _id: simulationID
    }, (error, simulation) => {
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

      for (const frontend of simulation.frontends) {
        frontendConnections[frontend.connectionIndex]['connection'].send(JSON.stringify({
          type: "simulation-confirm-close",
        }));
      }
    });
  }

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      const messageData = JSON.parse(message.utf8Data);

      switch(messageData.type) {
        case "simulation-start":
          _handleSimulationStart(messageData);
          break;
        case "simulation-state":
          _handleSimulationStateUpdate(messageData);
          break;
        case "simulation-close":
          _handleSimulationClose(messageData);
          break;
      }
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

      Simulation.update({_id: simulationID}, { $pull: { frameworks: { connectionIndex: index }}}, function (error, numAffected) {
        if (error || !numAffected) {
          console.log("Could not find corresponding simulation for connection");
          return
        }
      });
    }

    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

function lookup(objs, eqF) {
  for (const i in objs) {
    if (eqF(objs[i])) {
      return i;
    }
  }
  return -1;
}

fserver.listen(9000);
