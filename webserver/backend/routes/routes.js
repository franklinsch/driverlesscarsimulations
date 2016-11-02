const express = require('express');
const router = express.Router();
const async = require('async');
const Simulation = require('../models/Simulation');
const Journey = require('../models/Journey');

router.get('/', (req, res) => {
	res.sendFile('public/index.html', { root: __dirname });
});

router.get('/simulations/:simulationID', (req, res) => {
	Simulation.findOne({
		_id: req.params.simulationID
	})
	.then((result) => {
		res.send(result);
	})
	.catch((err) => {
		res.send(err);
	});
});

router.route('/simulations/:simulationID/journeys')
  .get((req, res) => {
    Simulation.findOne({
  		_id: req.params.simulationID
  	})
  	.then((result) => {
  		res.json(result.journeys);
  	})
  	.catch((err) => {
  		res.send(err);
  	});
  })
  .post((req, res) => {
    const id = req.params.simulationID;
    const journeys = req.body;
    savedJourneys = [];
    async.each(journeys, (journey, callback) => {
      const newJourney = new Journey(journey);
      newJourney.save()
      .then((savedJourney) => {
        console.log("Saved: " + savedJourney);
        savedJourneys.push(savedJourney);
        callback(null);
      })
      .catch((err) => {
        callback(err);
      });
    }, (err) => {
      const updateInfo = { $push: { journeys: { $each: savedJourneys }}};
      const options = {
        upsert: true,
        returnNewDocument: true
      };
      Simulation.findOneAndUpdate({ _id: id }, updateInfo, options)
      .then((result) => {
        console.log(result);
        res.send(result);
      })
      .catch((err) => {
        res.send(err);
      });
    });
  });

module.exports = router;
