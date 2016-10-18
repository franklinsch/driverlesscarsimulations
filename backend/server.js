const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const config = require('./config');

const app = express();

const db = require('./models/db');

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

var WebSocketServer = require('websocket').server;
var wsServer        = new WebSocketServer({ httpServer : server });

wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

  console.log((new Date()) + ' Connection accepted.');

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);

      const messageData = JSON.parse(message.utf8Data);
      if (messageData.type === "request-available-cities") {
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
