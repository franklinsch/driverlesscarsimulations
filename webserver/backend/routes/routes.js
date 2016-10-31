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
    const journeys = req.body;
    const updateInfo = { $push: { journeys: { $each: [{carID: 4}, {carID: 11}] }}};
    const options = {
      upsert: true,
      returnNewDocument: true
    };
    console.log(updateInfo);
    Simulation.findOneAndUpdate({ _id: id }, updateInfo, options)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
  });

module.exports = router;
