const fs = require("fs");

const node = JSON.parse(process.argv[2].substring(1));
const geojson = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));

const equal = function(point1, point2) {
  return point1[0] == point2[0] && point1[1] == point2[1];
};

for (const feature of geojson['features']) {
  if (feature['geometry']['type'] == 'LineString' && feature['properties']['highway']) {
    clength = feature['geometry']['coordinates'].length
    for (let i = 0; i < clength; i++) {
      const start = feature['geometry']['coordinates'][i];
      if (equal(start, node[0])) {
        if (i < clength - 1) {
          const end = feature['geometry']['coordinates'][i+1];
          if (equal(end, node[1])) {
            console.log(JSON.stringify(feature['properties']));
            return;
          }
        }
        if (i > 0) {
          const end = feature['geometry']['coordinates'][i-1];
          if (equal(end, node[1])) {
            console.log(JSON.stringify(feature['properties']));
            return;
          }
        }
      }
    }
  }
}
console.log(JSON.stringify({}));
