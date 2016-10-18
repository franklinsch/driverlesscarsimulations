const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const config = require('./config');

const WebSocketServer = require('websocket').server;

const app = express();

const db = require('./models/db');
const Simulation = require('./models/Simulation');

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
        { label: 'London', value: { position: {
          lat: 51.505,
          lng: -0.09
        }, zoom: 13 }},
        { label: 'Munich', value: { position: {
          lat: 48.1351,
          lng: 11.5820
        }, zoom: 13 }}
      ]
    }))
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

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);

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
