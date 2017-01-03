const start = {"type": "Feature", "id": 2324424196, "geometry": {"type": "Point", "coordinates": [-0.1745545, 51.4940211]}}
const end = {"type": "Feature", "id": 109871, "geometry": {"type": "Point", "coordinates": [-0.1625779, 51.5024834]}}

var fs = require('fs');
const geojson = JSON.parse(fs.readFileSync('cache.geojson', 'utf8'));

var PathFinder = require('geojson-path-finder');

var pathFinder = new PathFinder(geojson);
var path = pathFinder.findPath(start, end);
console.log(JSON.stringify(path));
