const should = require('chai').should();
const server = require('../server.js');

describe('Benchmarking', function() {
  describe('#getDistanceLatLonInKm(lat1,lon1,lat2,lon2)', function() {
    it('should return the distance between two points on Earth', function() {
      const dist = server.getDistanceLatLonInKm(1,2,2,3);
      dist.should.be.a('number');
      dist.should.be.closeTo(157.22543203807288, 0.001);
    });
  });
});
