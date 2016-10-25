const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./backend/routes/routes');
const config = require('./backend/config');

const WebSocketServer = require('websocket').server;

const app = express();


const db = require('./backend/db');
const Simulation = require('./backend/models/Simulation');
const City = require('./backend/models/City');

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', routes);

const server = app.listen(config.port, () => {
  const {address, port} = server.address();
  console.log(`The server is running at http://localhost:${port}/`);
});

const frontendConnections = []
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

  function _handleRequestSimulationStart(message, callback) {
    console.log("Received simulation start data: ");
    console.log(JSON.stringify(message, undefined, 2));
    const simulation = new Simulation({
      simulationStartParameters: {
        cityID: message.content.selectedCity._id,
        journeys: message.content.journeys
      },
      frontendConnectionIndices: [frontendConnections.length],
      simulationStates: []
    });

    simulation.save((error, simulation) => {
      if (error) {
        return console.error(error);
      }
      frontendConnections.push(connection)
    });
    console.log(simulation);

    callback(null, simulation._id);
  }

  function _handleRequestSimulationJoin(message) {
    Simulation.findByIdAndUpdate(message.content.simulationID, { $push: { frontendConnectionIndices: frontendConnections.length }}, { new: true }, function (error, simulation) {
      if (error || !simulation) {
        connection.send(JSON.stringify({
          type: "simulation-error",
          content: {
            message: "Could not find simulation with ID " + message.content.simulationID
          }
        }))
        console.log("Could not find simulation with ID " + message.content.simulationID);
        return
      }
      frontendConnections.push(connection);

      connection.send(JSON.stringify({
        type: "simulation-start-parameters",
        content: {
          simulationStartParameters: simulation.simulationStartParameters
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
        type: "event-update",
        content: {}
      }));
    });
  }

  connection.on('message', function(message) {
    if (message.type === 'utf8') {

      const messageData = JSON.parse(message.utf8Data);

      switch (messageData.type) {
      case "request-available-cities":
        _handleRequestAvailableCities();
        break;
      case "request-simulation-start":
        _handleRequestSimulationStart(messageData, (err, simID) => {
          connection.send(JSON.stringify({
            type: "simulation-id",
            content: {
              simulationID: simID
            }
          }));
        });
        break;
      case "request-simulation-join":
        _handleRequestSimulationJoin(messageData);
      case "request-event-update":
        _handleRequestEventUpdate(messageData);
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

      Simulation.findOneAndUpdate({ frontendConnectionIndices: index }, { $pull: { frontendConnectionIndices: index }}, function (error, simulation) {
        if (error || !simulation) {
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

    Simulation.findByIdAndUpdate(simulationID, { $set: { frameworkConnectionIndex: frameworkConnections.length }}, { new: true }, function (error, simulation) {
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

      connection.send(JSON.stringify({
        type: "simulation-start-parameters",
        content: {
          simulationStartParameters: simulation.simulationStartParameters
        }
      }));
    })
  }

  function _handleSimulationStateUpdate(message) {
    console.log("Received simulation-update from framework");

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

      simulation.simulationStates.push(message.content);
      simulation.save((error) => {
        if (error) {
          console.log("Could not update simulation");
        }

        console.log("Updated simulationState");
        for (let index of simulation.frontendConnectionIndices) {
          frontendConnections[index].send(JSON.stringify({
            type: "simulation-state",
            content: message.content
          }))
        }
      })
    })
  }

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      const messageData = JSON.parse(message.utf8Data);

      console.log(messageData);

      switch(messageData.type) {
      case "simulation-start":
        _handleSimulationStart(messageData);
      case "simulation-state":
        _handleSimulationStateUpdate(messageData);
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

      Simulation.findOneAndUpdate({ frameworkConnectionIndex: index }, { $unset: { frameworkConnectionIndex: "" }}, function (error, simulation) {
        if (error || !simulation) {
          console.log("Could not find corresponding simulation for connection");
          return
        }
      });
    }

    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

fserver.listen(9000);
