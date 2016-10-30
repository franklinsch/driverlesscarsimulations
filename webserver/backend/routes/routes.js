const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');

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
  		res.json(result.simulationStartParameters.journeys);
  	})
  	.catch((err) => {
  		res.send(err);
  	});
  })
  .post((req, res) => {
    const id = req.params.simulationID;
    const journeys = req.body.journeys;
    const updateInfo = {
      $push: { journeys: journeys }
    };
    Simulation.update({ _id: id }, updateInfo)
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      res.send(err);
    });
  });

module.exports = router;
