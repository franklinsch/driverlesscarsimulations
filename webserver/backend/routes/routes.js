const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');
const path = require('path');

router.get('/simulations/:simulationid', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
})

router.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});
module.exports = router;
