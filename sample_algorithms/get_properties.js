const fs = require("fs");

const node = JSON.parse(process.argv[2].substring(1));
const geojson = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));

const equal = function(point1, point2) {
  return point1[0] == point2[0] && point1[1] == point2[1];
};

const equalNodes = function(node1, node2) {
  return equal(node1[0], node2[0]) && equal(node1[1], node2[1]);
};

for (const feature of geojson['features']) {
  if (feature['geometry']['type'] == 'LineString' && feature['properties']['highway']) {
    for (let i = 0; i < feature['geometry']['coordinates'].length - 1; i++) {
      const start = feature['geometry']['coordinates'][i];
      const end = feature['geometry']['coordinates'][i+1];
      if (equalNodes(node, [start, end])) {
        console.log(JSON.stringify(feature['properties']));
        return;
      }
    }
  }
}
