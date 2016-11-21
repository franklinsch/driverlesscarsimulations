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
  timeslice: Number,
  hotspotInfo: {
    popularitySum: Number,
    hotspots: [Hotspot.schema],
  },
  journeys: [Journey.schema],
  frontends: [Frontend.schema],
  frameworks: [Framework.schema],
  simulationStates: [{
    id: String,
    formattedTimestamp: String,
    timestamp: Number,
    objects: [{
      id: String,
      frameworkID: String,
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
