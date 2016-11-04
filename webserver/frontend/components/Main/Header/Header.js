import React from 'react';
import CustomPropTypes from '../../Utils/CustomPropTypes.js';
import Dropdown from './Dropdown/Dropdown.jsx';
import JoinSimulationForm from './JoinSimulationForm/JoinSimulationForm.js';
import UtilFunctions from '../../Utils/UtilFunctions.js';

export default class Header extends React.Component {
  static propTypes = {
    socket: React.PropTypes.object,
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city),
    handleCityChange: React.PropTypes.func
  }

  _handleJoinSimulation(simulationID) {
    this.props.handleJoinSimulation(simulationID);
  }

  _handleCityChange(city) {
    this.props.handleCityChange(city._id);
  }

  render() {
    const cities = this.props.availableCities || [];

    return (
        <nav className="navbar navbar-dark bg-primary">
          <a className="navbar-brand" href="#">SAVN</a>
          <ul className="nav navbar-nav">
              <li className="nav-item active">
                  <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
              </li>
              <li className="nav-item">
                <Dropdown items={cities} onSelect={(city) => { this._handleCityChange(city) }} />
              </li>
          </ul>
        
          <JoinSimulationForm onSubmit={(simID) => {this._handleJoinSimulation(simID)}} />
      </nav>
    )
  }
}
