const mongoose = require('mongoose');

const simulationStateSchema = mongoose.Schema({
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
});

module.exports = mongoose.model('SimulationState', simulationStateSchema);
