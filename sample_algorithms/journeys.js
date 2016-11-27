var fs = require('fs');

const num = process.argv[2];
let journeys = [];
const city = {
  name: 'Kensington',
  bounds: {
    southWest: {
     lat: 51.4934,
     lng: -0.1957
    },
    northEast: {
     lat: 51.5025,
     lng: -0.1596
    }
  }
}
const bounds = city.bounds;
const latStart = bounds.southWest.lat;
const lngStart = bounds.southWest.lng;
const latDiff = bounds.northEast.lat - bounds.southWest.lat;
const lngDiff = bounds.northEast.lng - bounds.southWest.lng;

for (let i = 0; i < num; i++) {
  const rand1 = latStart + Math.random() * latDiff;
  const rand2 = lngStart + Math.random() * lngDiff;
  const rand3 = latStart + Math.random() * latDiff;
  const rand4 = lngStart + Math.random() * lngDiff;
  
  journeys.push({"origin":{"lat":rand1,"lng":rand2},"destination":{"lat":rand3,"lng":rand4},"typeInfo":{"name":"Car","kindName":"vehicle","parameters":{"Average Speed":"50","Top Speed":"120","Length":"450","Weight":"1355"}}})
}

const s = JSON.stringify(journeys);
fs.writeFile("new_journeys.json", s, function() {});
