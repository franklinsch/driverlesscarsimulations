const mongoose = require('mongoose');

const apiKeySchema = mongoose.Schema({
    title: String,
    hash: String,
    simulationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Simulation'
    }
});

module.exports = mongoose.model('APIKey', apiKeySchema);
