const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  admin: Boolean,
  created_at: Date,
  simulations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Simulation' }]
});

module.exports = mongoose.model('User', userSchema);
