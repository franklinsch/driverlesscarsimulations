const mongoose = require('mongoose');
const Journey = require('./Journey');

const simulationSchema = mongoose.Schema({
  city: {
    name: String,
    bounds: {
      northEast: {
        lat: Number,
        lng: Number
      },
      southWest: {
        lat: Number,
        lng: Number
      }
    }
  },
  journeys: [Journey.schema],
  frontendConnectionIndices: [Number],
  frameworkConnectionIndex: Number,
  simulationStates: [{
    id: String,
    timestamp: String,
    objects: [{
      id: String,
      objectType: String,
      speed: Number,
      direction: Number,
      route: [{}],
      position: {
        lat: Number,
        lng: Number
      }
    }]
  }]
});

module.exports = mongoose.model('Simulation', simulationSchema);
