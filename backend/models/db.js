const express = require('express');
const mongoose = require('mongoose');
const config = require('../config');

mongoose.connect(config.db)

const db = mongoose.connection;

db.on('error', () => {
  console.info('Error: Could not connect to MongoDB.')
})

module.exports = db;
