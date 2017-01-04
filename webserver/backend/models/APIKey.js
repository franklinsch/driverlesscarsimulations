const mongoose = require('mongoose');

const apiKeySchema = mongoose.Schema({
    hash: String,
    salt: String,
    simulationID: String,
});

module.exports = mongoose.model('APIKey', apiKeySchema);
