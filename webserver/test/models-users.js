const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const User = require('../backend/models/User');
const config = require('../backend/config');
const uuidV4 = require('uuid/v4');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const SALT_BYTES_LENGTH = 10;
const HASH_ITERATIONS = 1000;
const HASH_KEY_LENGTH = 64;
const DIGEST = 'sha1';

chai.use(sinonChai);
const should = chai.should();

describe('User Accounts Schema', function() {
  describe('#constructor()', function() {
    it('should be valid when a username is provided', function(done) {
      const u = new User({username: 'someone'});
      u.validate(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be invalid if there is no username', function(done) {
      const u = new User();
      u.validate(function(err) {
        err.should.exist;
        done();
      });
    });
  });

  describe('API Access', function() {
    let user;
    beforeEach(function() {
      user = new User({username: 'someone'});
    });

    describe('#setAPIAccess(id, key)', function() {
      it('should set the api access correctly', function() {
        const id = uuidV4();
        const key = uuidV4();
        user.setAPIAccess(id, key);
        const expected_hash = crypto.pbkdf2Sync(key, user.api_key_salt,
               HASH_ITERATIONS, HASH_KEY_LENGTH, DIGEST).toString('hex');
        user.api_key_hash.should.equal(expected_hash);
      });
    });

    describe('#validateAPIAccess(key)', function() {
      let key;
      let id;

      before(function() {
        id = uuidV4();
        key = uuidV4();
      });

      it('should validate the correct key', function() {
        user.setAPIAccess(id, key);
        user.validateAPIAccess(key).should.be.true;
      });

      it('should invalidate the wrong key', function() {
        user.setAPIAccess(id, key);
        user.validateAPIAccess('a').should.be.false;
      });
    });

    describe('#generateAPIToken(simulation, ip)', function() {
      it('should generate a valid token', function(done) {
        const simID = '1';
        const ip = '127.0.0.1'
        const token = user.generateAPIToken(simID, ip);
        jwt.verify(token, config.token_secret, function(err, decoded) {
          should.not.exist(err);
          decoded._id.should.equal(user._id.toString());
          decoded.sid.should.equal(simID);
          decoded.cip.should.equal(ip);
          const now = Math.floor(Date.now() / 1000);
          decoded.exp.should.be.above(now);
          done();
        });
      });
    });
  });

  describe('User Authentication', function() {
    let user;
    beforeEach(function() {
      user = new User({username: 'someone'});
    });

    describe('#setPassword(password)', function() {
      it('should set the password correctly', function() {
        const password= 'a_random_password';
        user.setPassword(password);
        const expected_hash = crypto.pbkdf2Sync(password, user.salt,
               HASH_ITERATIONS, HASH_KEY_LENGTH, DIGEST).toString('hex');
        user.hash.should.equal(expected_hash);
      });
    });

    describe('#validPassword(password)', function() {
      let password;

      before(function() {
        password = 'a_random_password';
      });

      it('should validate the correct password', function() {
        user.setPassword(password);
        user.validPassword(password).should.be.true;
      });

      it('should invalidate the wrong password', function() {
        user.setPassword(password);
        user.validPassword('another_random_password').should.be.false;
      });
    });

    describe('#generateJwt()', function() {
      it('should generate a valid token', function(done) {
        const token = user.generateJwt();
        jwt.verify(token, config.token_secret, function(err, decoded) {
          should.not.exist(err);
          decoded._id.should.equal(user._id.toString());
          const now = Math.floor(Date.now() / 1000);
          decoded.exp.should.be.above(now);
          done();
        });
      });
    });

  });
});
