const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const server = require('../server.js');
const Simulation = require('../backend/models/Simulation');
const sample = require('./factories').framework;

chai.use(sinonChai);
const should = chai.should();

describe('Framework Messages', function() {
  let connection;
  beforeEach(function() {
    connection = {
      send: sinon.spy()
    };
  });

  describe('#_handleJourneyComplete(message, connection)', function() {
    beforeEach(function() {
     sinon.stub(Simulation, 'update');
    });

    afterEach(function() {
      Simulation.update.restore();
    });

    it('should save the new completion log in the database', function() {
      message = sample.journeyCompleteMessage();
      const log = {
        duration: message.timestamp - message.journeyStart,
        distance: message.journeyDistance,
        journeyID: message.journeyID,
        frameworkID: message.frameworkID
      };
      server._handleJourneyComplete(message, connection);
      Simulation.update.should.have.been.called;
    });
  });

  describe('#_handleFrameworkConnect(message, connection)', function() {
    let frameworkConnections;
    beforeEach(function() {
      sinon.stub(Simulation, 'findById');
      frameworkConnections = [];
    });

    afterEach(function() {
      Simulation.findById.restore();
    });

    it('should tell the new framework when to start', function() {
      const message = sample.frameworkConnectMessage();
      simulation = sample.simulation();
      simulation.save = sinon.stub();
      Simulation.findById.yields(null, simulation);
      simulation.save.yields(null, simulation);
      server._handleFrameworkConnect(message, connection);
      connection.send.should.have.been.called;
    });
  });

});
