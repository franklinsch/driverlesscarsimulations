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
    distance: Number,
    journeyID: String,
    frameworkID: String
  }],
  numSimulationStates: Number,
  frameworks: [Framework.schema],
  simulationStates: [mongoose.Schema.Types.ObjectId],
  benchmarkValues: Object
});

module.exports = mongoose.model('Simulation', simulationSchema);
