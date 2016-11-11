const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const SALT_BYTES_LENGTH = 10;
const HASH_ITERATIONS = 1000;
const HASH_KEY_LENGTH = 64;


const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  hash: String,
  salt: String,
  admin: Boolean,
  created_at: Date,
  simulations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Simulation'
  }]
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(SALT_BYTES_LENGTH).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, HASH_ITERATIONS, HASH_KEY_LENGTH).toString('hex');
};

userSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, HASH_ITERATIONS, HASH_KEY_LENGTH).toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, config.token_secret);
};

module.exports = mongoose.model('User', userSchema);
