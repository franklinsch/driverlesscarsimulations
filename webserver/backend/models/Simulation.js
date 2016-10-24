const mongoose = require('mongoose');

const simulationSchema = mongoose.Schema({
  simulationInfo: {
    cityID: String,
    journeys: [{
      carID: Number,
      origin: {
        lat: Number,
        lng: Number
      },
      destination: {
        lat: Number,
        lng: Number
      }
    }]
  },
  frontendConnectionIndex: Number,
  frameworkConnectionIndex: Number,
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

module.exports = mongoose.model('Simulation', simulationSchema);
