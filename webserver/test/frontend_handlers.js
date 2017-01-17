const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
require('sinon-as-promised');
const mongoose = require('mongoose');
const server = require('../server');

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
