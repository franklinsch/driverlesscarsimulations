const Benchmarking = function () {
  const _dist = () => {
    return 157.22543203807288;
  };

  const _journeys = () => {
    return [{ _id: '1',
              origin: {lat: 1, lng: 2},
              destination: {lat: 2, lng: 3}},
            { _id: '2',
              origin: {lat: 1, lng: 2},
              destination: {lat: 2, lng: 3}},
            { _id: '3',
              origin: {lat: 1, lng: 2},
              destination: {lat: 2, lng: 3}}];
  };

  const _completionLogs= () => {
    const frameworkID = _frameworkID();
    return [{duration: 1, distance: 200,  journeyID: '1', frameworkID: frameworkID},
            {duration: 2, distance: 200, journeyID: '2', frameworkID: frameworkID},
            {duration: 3, distance: 200, journeyID: '3', frameworkID: frameworkID}];
  }

  const _benchmark = () => {
    const benchmark = {};
    benchmark[_frameworkID()] = {
      completionSpeed: ((3 * _dist()) / (1 + 2 + 3)) * 60 * 60,
      completionSpeedVariance: 0,
      slowestJourney: _dist() / 3 * 60 * 60,
      totalTime: 6 / (60 * 60),
      averageTime: 2 / (60 * 60),
      totalDistance: 3 * 200,
      averageSpeed: 100
    }
    return benchmark;
  };

  const _frameworkID = () => {
    return '42';
  }

  const _simID = () => {
    return '1';
  }

  const _simulation = () => {
    return { _id: _simID(),
            journeys: _journeys(),
            completionLogs: _completionLogs()};
  };

  return {
    dist: _dist,
    journeys: _journeys,
    completionLogs: _completionLogs,
    benchmark: _benchmark,
    simID: _simID,
    frameworkID: _frameworkID,
    simulation: _simulation,
  };
}();

const Routing = function() {
  const _user = () => {
    return {
      _id: 'some_id',
      username: 'some_user_name',
      simulations: 'some_simulations',
    }
  };

  return {
    user: _user,
  }
}();

const Framework = function() {
  const _journeyCompleteMessage = () => {
    return {
      simulationID: '42',
      timestamp: 15,
      journeyStart: 10,
      distance: 42,
      journeyID: '42',
      frameworkID: '1'
    }
  };

  const _frameworkConnectMessage = () => {
    return {
      simulationID: '42',
      timeslice: 20,
      name: 'Some framework',
    }
  };

  const _simulation = () => {
    return {
      timeslice: 15,
      latestTimestamp: 15,
      simulationStates: {
      },
      frameworks: ['some other framework'],
      frontends: [],
      journeys: [] ,
      city: 'some city'
    }
  };

  return {
    journeyCompleteMessage: _journeyCompleteMessage,
    frameworkConnectMessage: _frameworkConnectMessage,
    simulation: _simulation
  };
}();

module.exports = {
  benchmarking: Benchmarking,
  routing: Routing,
  framework: Framework
};
