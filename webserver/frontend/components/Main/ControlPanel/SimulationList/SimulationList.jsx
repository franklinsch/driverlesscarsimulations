import React from 'react';
import 'whatwg-fetch';

export default class SimulationList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const simulations = this.props.simulations || [];
    console.log(simulations);
    return (
      <div>
        <a className="btn waves-effect waves-light dropdown-button" href="#dropdown" data-activates="dropdown">
          My Simulations
        </a>
        <ul id="dropdown" className="dropdown-content">
            {
              simulations.map((simulation, index) => {
                console.log(simulation);
                const link = '#/simulations/' + simulation.simID;
                return (
                  <li key={ index }>
                    <a href={ link }> { simulation.simTitle ? simulation.simTitle : simulation.simID }</a>
                  </li>
                );
              })
            }
        </ul>
      </div>
    );
  }
}
