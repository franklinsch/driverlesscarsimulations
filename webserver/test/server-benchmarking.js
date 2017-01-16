const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sample = require('./factories').benchmarking;
const server = require('../server.js');
const Simulation = require('../backend/models/Simulation');

chai.use(sinonChai);
const should = chai.should();

describe('Benchmarking', function() {

  describe('#getDistanceLatLonInKm(lat1,lon1,lat2,lon2)', function() {
    it('should return the distance between two points on Earth', function() {
      const dist = server.getDistanceLatLonInKm(1,2,2,3);
      dist.should.be.a('number');
      dist.should.be.closeTo(sample.dist(), 0.001);
    });
  });

  describe('#deg2rad(deg)', function() {
    it('should convert degrees to radians', function() {
      let rad = server.deg2rad(0);
      rad.should.be.a('number');
      rad.should.be.closeTo(0, 0.001);
      rad = server.deg2rad(180);
      rad.should.be.a('number');
      rad.should.be.closeTo(Math.PI, 0.001);
      rad = server.deg2rad(360);
      rad.should.be.a('number');
      rad.should.be.closeTo(2*Math.PI, 0.001);
    });
  });

  describe('#getBenchmarks(journeys, completionLogs)', function() {
    it('should return the average speed to destination of all the completed journeys', function() {
      const frameworkID = sample.frameworkID();
      let journeys = {};
      for (const journey of sample.journeys()) {
        journeys[journey._id] = journey;
      }
      const cLogs = sample.completionLogs();
      const avg = server.getBenchmarks(journeys, cLogs);
      avg.should.be.an('object');
      avg.should.have.key(frameworkID);
      avg[frameworkID].should.be.an('object');
      avg[frameworkID].should.contain.key('completionSpeed');
      avg[frameworkID].completionSpeed.should.be.closeTo(sample.benchmark()[frameworkID].completionSpeed, 0.001);
    });
  });

  describe('#handleRequestSimulationBenchmark(message)', function() {
    let connection;
    beforeEach(function() {
      sinon.stub(Simulation, 'findById');
      connection = {
        send: sinon.spy()
      };
    });

    afterEach(function() {
      Simulation.findById.restore();
    });

    it('should send the benchmark value to the frontend', function() {
      let sim = sample.simulation();
      sim.update = sinon.spy();
      Simulation.findById.yields(null, sim);
      const simID = sample.simID()
      const message = { simulationID: simID };
      server._handleRequestSimulationBenchmark(message, connection);
      Simulation.findById.should.have.been.calledWith(simID);
      sim.update.should.have.been.called;
      connection.send.should.have.been.called;
    });
  });
});
