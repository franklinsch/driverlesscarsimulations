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
});
