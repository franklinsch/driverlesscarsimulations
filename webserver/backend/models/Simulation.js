const mongoose = require('mongoose');
const Journey = require('./Journey');
const Frontend = require('./Frontend');
const Framework = require('./Framework');
const Hotspot = require('./Hotspot')

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
  createdAt: Date,
  timeslice: Number,
  hotspots: [Hotspot.schema],
  latestTimestamp: Number,
  journeys: [Journey.schema],
  frontends: [Frontend.schema],
  frameworks: [Framework.schema],
  simulationStates: [{
    timestamp: Number,
    formattedTimestamp: String,
    id: String,
    frameworkStates: [{
      frameworkID: String,
      objects: [{
        id: String,
        journeyID: String,
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
  }]
});

module.exports = mongoose.model('Simulation', simulationSchema);
