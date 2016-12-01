const FilteredSimulation = class FilteredSimulation {
  constructor(simulation) {
    this.simulation = simulation;
  }

  _filterSimulation(simulation) {
    return {
      city: this._filterCity(simulation.city),
      journeys: this._filterJourneys(simulation.journeys),
      simulationStates: this._filterSimulationStates(simulation.simulationStates)
    };
  }

  _filterCity(city) {
    return {
      name: city.name,
      bounds: city.bounds
    };
  }

  _filterJourneys(journeys) {
    const filteredJourneys = [];

    for (let journey of journeys) {
      filteredJourneys.push(this._filterJourney(journey));
    }

    return filteredJourneys;
  }

  _filterJourney(journey) {
      return {
        carID: journey.carID,
        origin: journey.origin,
        destination: journey.destination
      };
  }

  _filterSimulationStates(simulationStates) {
    const filteredSimulationStates = [];

    for (let simulationState of simulationStates) {
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

    for (let frameworkState of frameworkStates) {
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

    for (let simulationObject of simulationObjects) {
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