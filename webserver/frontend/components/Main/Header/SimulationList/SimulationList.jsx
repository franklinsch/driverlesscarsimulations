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
        <a className="nav-link" href="#" id="SimulationListDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          My Simulations
        </a>
        <div id="auth-dropdown" className="dropdown-menu" aria-labelledby="SimulationListDropdown">
          <ul className="list-group">
            {
              simulations.map((simulation, index) => {
                const link = '/simulations/' + simulation;
                return (
                  <li key={ index }>
                    <a href={ link } className="list-group-item list-group-item-action">{ simulation }</a>
                  </li>
                );
              })
            }
          </ul>
        </div>
      </div>
    );
  }
}
