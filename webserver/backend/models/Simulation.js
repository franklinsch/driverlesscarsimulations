const mongoose = require('mongoose');

const simulationSchema = mongoose.Schema({
  simulationStartParameters: {
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
