const mongoose = require('mongoose');

const journeySchema = mongoose.Schema({
  carID: String,
  origin: {
    lat: Number,
    lng: Number
  },
  destination: {
    lat: Number,
    lng: Number
  }
});

module.exports = mongoose.model('Journey', journeySchema);
