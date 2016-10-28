const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');
const path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

router.get('/:simulationID', (req, res) => {
  Simulation.findOne({
    _id: req.params.simulationID
    })
    .then((result) => {
      res.sendFile(path.resolve('public/index.html'));
    })
    .catch((err) => {
      res.send(err);
    });
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

module.exports = router;
