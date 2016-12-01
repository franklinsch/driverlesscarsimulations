const FilteredSimulation = class FilteredSimulation {
  constructor(simulation) {
    this.simulation = simulation;
  }

  _filterSimulation(simulation) {
    return {
      city: simulation.city,
      journeys: simulation.journeys,
      simulationStates: this._filterSimulationStates(simulation.simulationStates)
    };
  }

  _filterSimulationStates(simulationStates) {
    const filteredSimulationStates = [];

    for (let simulationState in simulationStates) {
      filteredSimulationStates.push(this._filterSimulationState(simulationState));
    }

    return filteredSimulationStates;
  }

  _filterSimulationState(simulationState) {
    return {
      timestamp: simulationState.timestamp,
      frameworkStates: this._filterFrameworkStates(simulationState.frameworkStates)
    };
  }

  _filterFrameworkStates(frameworkStates) {
    const filteredFrameworkStates = [];

    for (let frameworkState in frameworkStates) {
      filteredFrameworkStates.push(this._filterFrameworkState(frameworkState));
    }

    return filteredFrameworkStates;
  }

  _filterFrameworkState(frameworkState) {
    return {
      objects: this._filterSimulationObjects(frameworkState.objects)
    };
  }

  _filterSimulationObjects(simulationObjects) {
    const filteredSimulationObjects = [];

    for (let simulationObject in simulationObjects) {
      filteredSimulationObjects.push(this._filterSimulationObject(simulationObject));
    }

    return filteredSimulationObjects;
  }

  _filterSimulationObject(simulationObject) {
    return {
      id: simulationObject.id,
      objectType: simulationObject.objectType,
      speed: simulationObject.speed,
      direction: simulationObject.direction,
      route: simulationObject.route,
      position: simulationObject.position
    };
  }

  get() {    
    return this._filterSimulation(this.simulation);
  }
}

module.exports = FilteredSimulation;