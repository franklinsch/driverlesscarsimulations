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
  api_id: String
  api_key_hash: String
  api_key_salt: String
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

userSchema.methods.validateAPIAccess = function(id, key) {
  const id_hash = crypto.pbkdf2Sync(id, this.api_access.id_salt, HASH_ITERATIONS, HASH_KEY_LENGTH, DIGEST).toString('hex');
  const key_hash = crypto.pbkdf2Sync(key, this.api_access.key_salt, HASH_ITERATIONS, HASH_KEY_LENGTH, DIGEST).toString('hex');
  return this.api_access.id_hash === id_hash && this.api_access.key_hash = key_hash;

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
  }, config.token_secret);
};

module.exports = mongoose.model('User', userSchema);
