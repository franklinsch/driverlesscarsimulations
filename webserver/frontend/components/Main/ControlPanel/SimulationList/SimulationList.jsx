import React from 'react';
import 'whatwg-fetch';

export default class SimulationList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const simulations = this.props.simulations || [];
    return (
      <div>
        <a className="btn waves-effect waves-light dropdown-button" data-activates="dropdown">
          My Simulations
        </a>
        <ul id="dropdown" className="dropdown-content">
            {
              simulations.map((simulation, index) => {
                const link = '#/simulations/' + simulation;
                return (
                  <li key={ index }>
                    <a href={ link }> { simulation }</a>
                  </li>
                );
              })
            }
        </ul>
      </div>
    );
  }
}
