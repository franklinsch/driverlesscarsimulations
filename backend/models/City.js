var mongoose = require('mongoose');

const City = moongoose.Schema({
  id: { type: String, unique: true, index: true },
  position: {
    lat: Number,
    lng: Number
  }, 
  zoom: Number
})

export default mongoose.model('City', new City);
