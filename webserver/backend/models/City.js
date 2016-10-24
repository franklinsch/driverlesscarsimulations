const mongoose = require('mongoose');

const citySchema = mongoose.Schema({
  name: String,
  bounds: {
    southWest: {
      lat: Number,
      lng: Number
    },
    northEast: {
      lat: Number,
      lng: Number
    }
  }
});

module.exports = mongoose.model('City', citySchema);
