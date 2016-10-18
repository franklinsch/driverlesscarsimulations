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

const City = moongoose.Schema({
  id: { type: String, unique: true, index: true },
  position: {
    lat: Number,
    lng: Number
  }, 
  zoom: Number
})

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
