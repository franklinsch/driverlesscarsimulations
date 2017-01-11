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
  completionLogs: [{
    duration: Number,
    journeyID: String,
    frameworkID: String
  }],
  frameworks: [Framework.schema],
  simulationStates: [{
    communicated: Boolean,
    timestamp: Number,
    participants: [String],
    frameworkStates: [{
      frameworkID: String,
      timestamp: Number,
      objects: [{
        id: String,
        journeyID: String,
        objectType: String,
        speed: Number,
        bearing: Number,
        route: [{}],
        position: {
          lat: Number,
          lng: Number
        }
      }]
    }]
  }],
  benchmarkValues: Object
});

module.exports = mongoose.model('Simulation', simulationSchema);
