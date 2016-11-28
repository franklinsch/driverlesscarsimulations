const FilteredSimulation = class FilteredSimulation {
  constructor(simulation) {
    this.simulation = simulation;
  }

  get() {
    console.log('test');
    return this.simulation;
  }
}

module.exports = FilteredSimulation;