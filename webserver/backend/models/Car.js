const Car = mongoose.Schema({
  id: { type: String, unique: true},
  position: {
    lat: Number,
    lng: Number
  },
  direction: Number
  speed: Number
  route: {
    startLat: Number,
    startLng: Number,
    endLat: Number,
    endLng: Number,}
})

module.exports = mongoose.model('Car', Car);
