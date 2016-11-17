const mongoose = require('mongoose');

const frameworkSchema = mongoose.Schema({
  connectionIndex: Number
});

module.exports = mongoose.model('Framework', frameworkSchema);
