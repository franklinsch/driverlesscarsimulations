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
    return [{duration: 1, journeyID: '1', frameworkID: frameworkID},
            {duration: 2, journeyID: '2', frameworkID: frameworkID},
            {duration: 3, journeyID: '3', frameworkID: frameworkID}];
  }

  const _benchmark = () => {
    const benchmark = {};
    benchmark[_frameworkID()] = ((3 * _dist()) / (1 + 2 + 3)) * 60 * 60;
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

module.exports = {
  benchmarking: Benchmarking,
  routing: Routing,
};
