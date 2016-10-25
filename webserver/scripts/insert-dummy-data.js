const db = require('../backend/db');
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
        lat: 50.68166,
        lng: 4.78482
      },
      northEast: {
        lat: 50.68347,
        lng: 4.78780
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
          callback(null);
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
