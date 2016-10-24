const mongoose = require('mongoose');

const Connection = mongoose.Schema({
  simulationId: String,
  frontendConnection: Object,
  frameworkConnection: Object
});

module.exports = mongoose.model('Connection', Connection);
