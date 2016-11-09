start = JSON.parse(process.argv[2].substring(1));
end = JSON.parse(process.argv[3].substring(1));
var fs = require('fs');
const geojson = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));

var PathFinder = require('geojson-path-finder');

var pathFinder = new PathFinder(geojson);
var path = pathFinder.findPath(start, end);
console.log(JSON.stringify(path));
