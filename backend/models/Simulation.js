var mongoose = require('mongoose');

const Simulation = mongoose.Schema({
  id: { type: String, unique: true, index: true },
  cityName: String,
  timeline: [{
    timestamp: String,
    objects: [{
      type: String,
      location: [Number]
    }]
  }]
});

export default mongoose.model('Simulation', new Simulation);
