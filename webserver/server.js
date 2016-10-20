const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./backend/routes/routes');
const config = require('./backend/config');

const WebSocketServer = require('websocket').server;

const app = express();

const Simulation = require('./backend/models/Simulation');
const db = require('./backend/models/db');

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

const frontendSocketServer = new WebSocketServer({ httpServer : server });

var frontendConnection;

frontendSocketServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  
  frontendConnection = connection;

  console.log((new Date()) + ' Frontend Connection accepted.');

  function _handleRequestAvailableCities() {
    connection.send(JSON.stringify({
      type: "available-cities",
      content: [
        { 
          label: 'example2',
          value: { 
            id: "0",
            bounds: {
              southWest: {
                lat: 50.68156,
                lng: 4.78412
              },
              northEast: {
                lat: 50.68357,
                lng: 4.78830
              }
            }
          }
        },
      ]
    }));
  }

  function _handleRequestSimulationStart(message, callback) {
    console.log("Received simulation start data: ");
    console.log(JSON.stringify(message, undefined, 2));
    const simulation = new Simulation({
      simulationInfo: {
        cityID: message.content.selectedCity.label
      },
      simulationStates: []
    });

    simulation.save((error) => {
      if (error) {
        console.log("Could not save new simulation");
        return
      }
    })
    console.log(simulation);
    callback(null, simulation._id);
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
          console.log("Sending simID");
          connection.send(JSON.stringify({
            id: simID
          }));
        });
        break;
      }
    }
    else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });

  connection.on('close', function(reasonCode, description) {
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

    Simulation.findOne({
      _id: simulationID
    }, (error, simulation) => {
      if (error) {
        console.log("Could not find simulation with ID " + simulationID);
        return
      }

      connection.send(JSON.stringify({
        type: "simulation-info",
        content: {
          simulationInfo: simulation.simulationInfo
        }
      }))
    })
  }

  function _handleSimulationStateUpdate(message) {
    console.log("Received simulation-update from framework");

    const simulationID = message.content.simulationId;

    Simulation.findOne({
      _id: simulationID
    }, (error, simulation) => {
      if (error) {
        console.log("Could not find simulation with ID " + simulationID);
        return
      }

      simulation.simulationStates.push(message.content);
      simulation.save((error) => {
        if (error) {
          console.log("Could not save new simulation");
        }

        console.log("Updated simulationState");
        frontendConnection.send(JSON.stringify({
          type: "simulation-state",
          content: message.content
        }))
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
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

fserver.listen(9000);
