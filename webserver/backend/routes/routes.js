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

module.exports = router;
