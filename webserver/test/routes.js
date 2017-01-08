const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
require('sinon-as-promised');
const request = require('supertest');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const sample = require('./factories').routing;
const User = require('../backend/models/User');
const server = require('../server');
const config = require('../backend/config');

chai.use(sinonChai);
const should = chai.should();

describe('Routing', function() {

  const url = 'http://localhost:' + config.port;
  const mockFindById = {
    exec: sinon.stub()
  };

  describe('/simulations', function() {
    const route = url + '/simulations'
    const err = new Error('error');

    describe('GET', function() {

      const user = sample.user();
      const decoded_token = { _id: user._id };

      beforeEach(function() {
        sinon.stub(User, 'findOne');
        sinon.stub(User, 'findById');
        sinon.stub(jwt, 'verify');
      });

      afterEach(function() {
        User.findOne.restore();
        User.findById.restore();
        jwt.verify.restore();
      });

      it("should return a user's simulations", function(done) {
        jwt.verify.yields(null, decoded_token);
        User.findById.returns(mockFindById);
        mockFindById.exec.yields(null, user);
        User.findOne.resolves(user);
        request(url)
          .get('/simulations')
          .set('token', 'some_token')
          .expect(200, {
            userID: user._id,
            username: user.username,
            simulations: user.simulations
          }, done);
      });

      it('should error when the user is not found', function(done) {
        jwt.verify.yields(null, decoded_token);
        User.findById.returns(mockFindById);
        mockFindById.exec.yields(null, user);
        User.findOne.rejects(err);
        request(url)
          .get('/simulations')
          .set('token', 'some_token')
          .expect(200, err , done);
      });
    });

    describe('POST', function() {
      const user = sample.user();
      const decoded_token = { _id: user._id };

      beforeEach(function() {
        sinon.stub(User, 'findOneAndUpdate');
        sinon.stub(User, 'findById');
        sinon.stub(jwt, 'verify');
      });

      afterEach(function() {
        User.findOneAndUpdate.restore();
        User.findById.restore();
        jwt.verify.restore();
      });

      it('should return the updated user on success', function(done) {
        jwt.verify.yields(null, decoded_token);
        User.findById.returns(mockFindById);
        mockFindById.exec.yields(null, user);
        User.findOneAndUpdate.resolves(user);
        request(url)
          .post('/simulations')
          .set('token', 'some_token')
          .field('simulationID', 'some_simulation_id')
          .expect(200, user, done);
      });

      it('should return an error on failure', function(done) {
        jwt.verify.yields(null, decoded_token);
        User.findById.returns(mockFindById);
        mockFindById.exec.yields(null, user);
        User.findOneAndUpdate.rejects(err);
        request(url)
          .post('/simulations')
          .set('token', 'some_token')
          .field('simulationID', 'some_simulation_id')
          .expect(200, err, done);
      });

    });
  });
});
