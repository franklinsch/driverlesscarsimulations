const db = require('../backend/models/db');
const City = require('../backend/models/City');
const async = require('async');

const CITIES = ['London', 'Paris', 'NYC'];

function randomNumber(from, to) {
  return (Math.random() * (to - from) + from);
}

function randomCity(city, from, to) {
  return {
    name: city,
    bounds: {
      southWest: {
        lat: randomNumber(from, to),
        lng: randomNumber(from, to)
      },
      northEast: {
        lat: randomNumber(from, to),
        lng: randomNumber(from, to)
      }
    }
  };
}

function generateRandomCities() {
  City.remove({}, (err) => {
    async.each(CITIES, (city, callback) => {
      let newCity = new City(randomCity(city, 30, 60));
      newCity.save((err, result) => {
        if (err) {
          callback(err);
        } else {
          console.log(`Successfully inserted ${city}...`);
          callback();
        }
      });
    }, (err) => {
      if (err) {
        console.log(`Something bad happened: ${err}`);
        process.exit(1);
      } else {
        console.log(`Successfully inserted ${CITIES.length} cities`);
        process.exit();
      }
    });
  });
}
generateRandomCities();
