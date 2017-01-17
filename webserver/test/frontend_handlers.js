const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
require('sinon-as-promised');
const request = require('supertest');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../backend/models/User');
const server = require('../server');
const config = require('../backend/config');

const City = require('../backend/models/City');

const sample = require('./factories').benchmarking;

chai.use(sinonChai);
const should = chai.should();

describe('Sending available cities to the frontend', function() {
  let connection;

  beforeEach(function() {
    sinon.stub(City, 'find');
    connection = {
      send: sinon.spy()
    }
  })

  afterEach(function() {
    City.find.restore();
  })

  it('should send available cities', function() {
    City.find.yields(null, {});
    server._handleRequestAvailableCities(connection);
    connection.send.should.have.been.calledWith(JSON.stringify({
      type: "available-cities",
      content: {}
    })); 
  })
})
