const mongoose = require('mongoose');

const City = mongoose.Schema({
  id: { type: String, unique: true, index: true },
  position: {
    lat: Number,
    lng: Number
  },
  zoom: Number
})

module.exports = mongoose.model('City', City);
