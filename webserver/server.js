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

frontendSocketServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

  console.log((new Date()) + ' Connection accepted.');

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

    setTimeout(_sendSimulationState, 2000);
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
    console.log(simulation);
    callback(null, simulation._id);
  }

  var count = 0.0001;

  function _sendSimulationState() {
    connection.send(JSON.stringify({
      type: "simulation-state",
      content:
      {
        id: "0",
        timestamp: "00:00:00",
        objects: [{
          id: "0",
          type: "car",
          position: {
            lat: 50.68264,
            lng: 4.7866131 + count
          }
        }]
      }
    }));
    count += 0.0001;
    setTimeout(_sendSimulationState, 2000);
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

  function handleSimulationStart(message) {
    console.log("Received simulation-start from framework");

    const simulationID = message.content.simulationID

    db.Simulation.find({
      _id: simulationID
    }, (err, simulation) => {
      if (error) {
        console.log("Could not find simulation with ID " + simulationID);
        return
      }

      connection.send(JSON.stringify({
        type: "simulationInfo",
        content: {
          simulationInfo: simulation.simulationInfo
        }
      }))
    })
  }

  function handleSimulationStateUpdate(message) {
    console.log("Received simulation-update from framework");

    const simulationID = message.content.simulationID;

    db.Simulation.find({
      _id: simulationID
    }, (err, simulation) => {
      if (error) {
        console.log("Could not find simulation with ID " + simulationID);
        return
      }

      const simulationState = message.content.simulationState;

      simulation.simulationStates.push(simulationState);
      simulation.save((error) => {
        if (error) {
          console.log("Could not save new simulation");
        }

        console.log("Updated simulationState");
      })
    })
  }

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      const messageData = message.utf8Data;

      switch(message.type) {
      case "simulationStart":
        _handleSimulationStart(messageData)
      }

      connection.send(JSON.stringify({'timestamp': 0}));
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
