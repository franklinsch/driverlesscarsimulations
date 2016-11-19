const mongoose = require('mongoose');

const hotspotSchema = mongoose.Schema({
  name: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  popularityLevels: [{
   "startTime": String,
   "endTime": String,
    level: Number
  }]


});

module.exports = mongoose.model('Hotspot', hotspotSchema);
