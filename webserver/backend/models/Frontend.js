const mongoose = require('mongoose');

const frontendSchema = mongoose.Schema({
  connectionIndex: Number
});

module.exports = mongoose.model('Frontend', frontendSchema);
