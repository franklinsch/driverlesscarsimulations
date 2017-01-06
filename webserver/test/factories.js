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
    return [{duration: 1, journeyID: '1'},
            {duration: 2, journeyID: '2'},
            {duration: 3, journeyID: '3'}];
  }

  const _benchmark = () => {
    return ((3 * _dist()) / (1 + 2 + 3)) * 60 * 60;
  };

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
    simulation: _simulation,
  };

}();

module.exports = {
  benchmarking: Benchmarking,
};
