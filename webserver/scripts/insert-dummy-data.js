const db = require('../backend/db');
const City = require('../backend/models/City');
const async = require('async');

const CITYNAMES = ['London', 'Paris', 'NYC'];

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

const CITIES = [
  {
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
  },
  {
    name: 'Moulin',
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
  },
  {
    name: 'LargeMoulin',
    bounds: {
      southWest: {
        lat: 50.6658,
        lng: 4.7397
      },
      northEast: {
        lat: 50.6993,
        lng: 4.8184
      }
    }
  }
];

function generateRandomCities() {
  City.remove({}, (err) => {
    async.each(CITYNAMES, (city, callback) => {
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
        console.log(`Successfully inserted ${CITYNAMES.length} cities`);
        process.exit();
      }
    });
  });
}

function insertCities(cities) {
  City.remove({}, (err) => {
    async.each(cities, (city, callback) => {
      let newCity = new City(city);
      newCity.save((err, result) => {
        if (err) {
          callback(err);
        } else {
          console.log(`Successfully inserted ${city.name}...`);
          callback(null);
        }
      });
    }, (err) => {
      if (err) {
        console.log(`Something bad happened: ${err}`);
        process.exit(1);
      } else {
        console.log(`Successfully inserted ${cities.length} cities`);
        process.exit();
      }
    });
  });
}
insertCities(CITIES);
