const express = require('express');
const mongoose = require('mongoose');
const config = require('../config');

mongoose.connect(config.db)

const db = mongoose.connection;

module.exports = db;
