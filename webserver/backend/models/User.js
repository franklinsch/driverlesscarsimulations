const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const SALT_BYTES_LENGTH = 10;
const HASH_ITERATIONS = 1000;
const HASH_KEY_LENGTH = 64;
const DIGEST = 'sha1';



const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  api_id: String,
  api_key_hash: String,
  api_key_salt: String,
  hash: String,
  salt: String,
  admin: Boolean,
  created_at: Date,
  active_simulation: String,
  simulations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Simulation'
  }]
});

userSchema.methods.setAPIAccess = function(id, key) {
  this.api_id = id
  this.api_key_salt = crypto.randomBytes(SALT_BYTES_LENGTH).toString('hex');
  this.api_key_hash = crypto.pbkdf2Sync(key, this.api_access.key_salt, HASH_ITERATIONS, HASH_KEY_LENGTH, DIGEST).toString('hex');
}

userSchema.methods.validateAPIAccess = function(key) {
  const hash = crypto.pbkdf2Sync(key, this.api_access.key_salt, HASH_ITERATIONS, HASH_KEY_LENGTH, DIGEST).toString('hex');
  return this.api_key_hash = hash;

}

userSchema.methods.generateAPIToken = function(simulation, ip) {
  let simID = this.active_simulation;
  if (simulation) {
    simID = simulation;
  }
  const dayInSec = 24 * 60 * 60
  //expires in 100 days
  return jwt.sign({
    _id: this._id,
    sid: simID,
    cip: ip,
    exp: Math.floor(Date.now() / 1000) + 100 * dayInSec
  }, config.TOKEN_SECRET);
}

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(SALT_BYTES_LENGTH).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, HASH_ITERATIONS, HASH_KEY_LENGTH, DIGEST).toString('hex');
};

userSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, HASH_ITERATIONS, HASH_KEY_LENGTH, DIGEST).toString('hex');
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
  }, config.TOKEN_SECRET);
};

module.exports = mongoose.model('User', userSchema);
