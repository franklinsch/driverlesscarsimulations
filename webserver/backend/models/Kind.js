const mongoose = require('mongoose');
const User = require('./User');

const kindSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  library: {
    type: Boolean,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  json_schema: Object
});

module.exports = mongoose.model('Kind', kindSchema);
