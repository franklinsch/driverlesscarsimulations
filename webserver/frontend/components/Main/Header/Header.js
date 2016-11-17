import React from 'react';
import CustomPropTypes from '../../Utils/CustomPropTypes.js';
import Dropdown from './Dropdown/Dropdown.jsx';
import JoinSimulationForm from './JoinSimulationForm/JoinSimulationForm.js';
import LoginDropdown from './LoginButton/LoginButton.js';
import UtilFunctions from '../../Utils/UtilFunctions.js';

export default class Header extends React.Component {
  static propTypes = {
    socket: React.PropTypes.object,
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city),
    handleCityChange: React.PropTypes.func,
    handleTokenChange: React.PropTypes.func,
    token: React.PropTypes.string
  }

  _handleJoinSimulation(simulationID) {
    this.props.handleJoinSimulation(simulationID);
  }

  _handleCityChange(city) {
    this.props.handleCityChange(city._id);
  }

  _handleTokenChange(token) {
    this.props.handleTokenChange(token);
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
              <li className="nav-item">
                <LoginDropdown token={this.props.token} onTokenChange={(token) => {this._handleTokenChange(token) }} />
              </li>
          </ul>

          <JoinSimulationForm onSubmit={(simID) => {this._handleJoinSimulation(simID)}} />
      </nav>
    )
  }
}
