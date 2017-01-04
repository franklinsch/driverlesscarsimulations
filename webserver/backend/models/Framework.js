const mongoose = require('mongoose');

const frameworkSchema = mongoose.Schema({
  connectionIndex: Number,
  name: String
});

module.exports = mongoose.model('Framework', frameworkSchema);
