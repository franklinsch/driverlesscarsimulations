const mongoose = require('mongoose');

const frameworkSchema = mongoose.Schema({
  connectionIndex: Number,
  name: String,
  timeslice: Number,
  nextTimestamp: Number
});

module.exports = mongoose.model('Framework', frameworkSchema);
