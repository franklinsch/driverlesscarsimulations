import React from 'react';
import CustomPropTypes from '../../Utils/CustomPropTypes.jsx';
import Dropdown from './Dropdown/Dropdown.jsx';
import JoinSimulationForm from './JoinSimulationForm/JoinSimulationForm.jsx';
import LoginButton from './LoginButton/LoginButton.jsx';
import UtilFunctions from '../../Utils/UtilFunctions.jsx';

export default class Header extends React.Component {
  static propTypes = {
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city),
    token: React.PropTypes.string,
    handlers: React.PropTypes.object
  }

  handleCityChange(city) {
    this.props.handlers.handleCityChange(city._id);
  }

  render() {
    const cities = this.props.availableCities || [];

    const dropdownHandlers = {
      handleSelect : ::this.handleCityChange
    }

    const joinSimulationFormHandlers = {
      handleSubmit : this.props.handlers.handleJoinSimulation
    }

    const loginButtonHandlers = {
      handleTokenChange : this.props.handlers.handleTokenChange
    }

    return (
      <nav className="navbar navbar-dark bg-primary">
        <a className="navbar-brand" href="#">SAVN</a>
          <ul className="nav navbar-nav">
            <li className="nav-item active">
              <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item">
              <Dropdown 
                items    = {cities}
                handlers = {dropdownHandlers}
              />
            </li>
            <li className="nav-item">
              <LoginButton 
                token    = {this.props.token}
                handlers = {loginButtonHandlers}
              />
            </li>
          </ul>
          <JoinSimulationForm 
            handlers = {joinSimulationFormHandlers} 
          />
      </nav>
    )
  }
}
