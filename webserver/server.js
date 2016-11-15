const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const routes = require('./backend/routes/routes');
const config = require('./backend/config');
const passwordConfig = require('./backend/password');

const WebSocketServer = require('websocket').server;

const app = express();


const db = require('./backend/db');
const Simulation = require('./backend/models/Simulation');
const City = require('./backend/models/City');

Simulation.update({}, { $set: {frontendConnectionIndices: []}, $unset: {frameworkConnectionIndex: ''}}, {multi: true}, function(err, numAffected) {
  if (err) {
    return;
  }
  console.log("Initial check successful");
});

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

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
const frontendInfo = []
const frameworkConnections = []

const frontendSocketServer = new WebSocketServer({ httpServer : server });

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

  function _handleRequestSimulationStart(message, callback) {
    const data = message.content;
    const simulation = new Simulation({
      city: data.selectedCity,
      journeys: data.journeys,
      frontendConnectionIndices: [frontendConnections.length],
      simulationStates: []
    });

    simulation.save((error, simulation) => {
      if (error) {
        return console.error(error);
      }
      frontendConnections.push(connection);
      frontendInfo.push({'timestamp': 0, 'speed': null});
    });

    callback(null, simulation._id, data.selectedCity._id);
  }

  function _handleRequestSimulationJoin(message) {
    Simulation.findByIdAndUpdate(message.content.simulationID, { $push: { frontendConnectionIndices: frontendConnections.length }}, { new: true }, function (error, simulation) {
      if (error || !simulation) {
        connection.send(JSON.stringify({
          type: "simulation-error",
          content: {
            message: "Could not find simulation with ID " + message.content.simulationID
          }
        }));
        console.log("Could not find simulation with ID " + message.content.simulationID);
        return;
      }
      frontendConnections.push(connection);
      const numStates = simulation.simulationStates.length;
      let latestTimestamp = 0;
      if (numStates > 0) {
        latestTimestamp = simulation.simulationStates[numStates-1]['timestamp'];
      }
      frontendInfo.push({'timestamp': latestTimestamp, 'speed': null});

      connection.send(JSON.stringify({
        type: "simulation-start-parameters",
        content: {
          simID: simulation._id,
          city: simulation.city,
          journeys: simulation.journeys
        }
      }));
    })
  }

  function _handleRequestEventUpdate(message) {
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

      frameworkConnections[simulation.frameworkConnectionIndex].send(JSON.stringify({
        type: "simulation-update",
        content: message.content
      }));
    });
  }

  function _handleRequestSimulationSpeedChange(message) {
    let index = frontendConnections.indexOf(connection);
    frontendInfo[index]['speed'] = message.content.simulationSpeed;
  }

  function _handleRequestSimulationTimestampChange(message) {
    let index = frontendConnections.indexOf(connection);
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

      frontendInfo[index]['timestamp'] = message.content.timestamp;
      const stateIndex = Math.floor(frontendInfo[index]['timestamp'] / simulation.timeslice);
      frontendConnections[index].send(JSON.stringify({
        type: "simulation-state",
        content: {
          state: simulation.simulationStates[stateIndex]
        }
      }))
    });
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

      if (simulation.frameworkConnectionIndex) {
        frameworkConnections[simulation.frameworkConnectionIndex].send(JSON.stringify({
          type: "simulation-close",
          content: message.content
        }));
      }
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
        _handleRequestSimulationStart(messageData, (err, simID, cityID) => {
          connection.send(JSON.stringify({
            type: "simulation-id",
            content: {
              id: simID,
              cityID: cityID
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
      }
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });

  connection.on('close', function(reasonCode, description) {
    let index = frontendConnections.indexOf(connection);
    if (index >= 0) {
      delete frontendConnections[index];
      delete frontendInfo[index];

      Simulation.update({ frontendConnectionIndices: index }, { $pull: { frontendConnectionIndices: index }}, function (error, numAffected) {
        if (error || !numAffected) {
          console.log("Could not find corresponding simulation for connection");
          return
        }
      });
    }

    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

const fserver = require('http').createServer();
const frameworkSocketServer = new WebSocketServer({ httpServer: fserver });

frameworkSocketServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

  console.log((new Date()) + ' Connection accepted.');

  function _handleSimulationStart(message) {
    console.log("Received simulation-start from framework");

    const simulationID = message.content.simulationId

    Simulation.findByIdAndUpdate(simulationID, { $set: { timeslice: message.content.timeslice, frameworkConnectionIndex: frameworkConnections.length, simulationStates: [] }}, { new: true }, function (error, simulation) {
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

      frameworkConnections.push(connection);

      for (let index of simulation.frontendConnectionIndices) {
        frontendInfo[index]['timestamp'] = 0;
      }

      connection.send(JSON.stringify({
        type: "simulation-start-parameters",
        content: {
          city: simulation.city,
          journeys: simulation.journeys
        }
      }));
    })
  }

  function _handleSimulationStateUpdate(message) {
    console.log("Received simulation-update from framework");

    const simulationID = message.content.simulationId;

    Simulation.findByIdAndUpdate(simulationID, { $push: { simulationStates: message.content } }, { new: true }, function (error, simulation) {
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
      for (let index of simulation.frontendConnectionIndices) {
        if (frontendInfo[index]['speed'] != undefined) {
          frontendInfo[index]['timestamp'] += frontendInfo[index]['speed']
          if (frontendInfo[index]['timestamp'] > message.content.timestamp) {
            frontendInfo[index]['timestamp'] = message.content.timestamp;
          }
        } else {
          frontendInfo[index]['timestamp'] = message.content.timestamp;
        }
        const stateIndex = Math.floor(frontendInfo[index]['timestamp'] / simulation.timeslice);
        frontendConnections[index].send(JSON.stringify({
          type: "simulation-state",
          content: {
            state: simulation.simulationStates[stateIndex],
            latestTimestamp: message.content.timestamp
          }
        }))
      }
    });
  }

  function _handleSimulationClose(message) {
    console.log("Received close confirmation from framework");

    const simulationID = message.content.simulationId;

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
      for (let index of simulation.frontendConnectionIndices) {
        frontendConnections[index].send(JSON.stringify({
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
      }
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });

  connection.on('close', function(reasonCode, description) {
    let index = frameworkConnections.indexOf(connection);
    if (index >= 0) {
      delete frameworkConnections[index];

      Simulation.update({ frameworkConnectionIndex: index }, { $unset: { frameworkConnectionIndex: "" }}, function (error, numAffected) {
        if (error || !numAffected) {
          console.log("Could not find corresponding simulation for connection");
          return
        }
      });
    }

    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

fserver.listen(9000);
