const mongoose = require('mongoose');

const Simulation = mongoose.Schema({
  simulationInfo: {
    cityID: String
  },
  simulationStates: [{
    id: String,
    timestamp: String,
    objects: [{
      id: String,
      type: String,
      position: {
        lat: Number,
        lng: Number
      }
    }]
  }]
});

module.exports = mongoose.model('Simulation', Simulation);
