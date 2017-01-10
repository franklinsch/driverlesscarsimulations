const Simulation = require('./backend/models/Simulation');

Simulation.find({}, () => {
  console.log("here")
})
