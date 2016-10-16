import React from 'react';
import SimulationMap from './SimulationMap/SimulationMap.js';

export default class App extends React.Component {
  render() {
    return (
      <SimulationMap 
        width={ 300 + 'px' }
        height={ 300 + 'px' }
        position={ [51.505, -0.09] }
        zoom={ 13 }
        markers= { [[51.505, -0.09], [51.506, -0.092]] }
      />
    )
  }
}

