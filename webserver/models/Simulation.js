var mongoose = require('mongoose');

const Simulation = moongoose.Schema({
  id: { type: String, unique: true, index: true },
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

export default mongoose.model('Simulation', new Simulation);
