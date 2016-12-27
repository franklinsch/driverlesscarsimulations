import React from 'react';
import CustomPropTypes from '../../Utils/CustomPropTypes.jsx';
import Dropdown from './Dropdown/Dropdown.jsx';
import JoinSimulationForm from './JoinSimulationForm/JoinSimulationForm.jsx';
import LoginButton from './LoginButton/LoginButton.jsx';
import SimulationList from './SimulationList/SimulationList.jsx';
import UtilFunctions from '../../Utils/UtilFunctions.jsx';

export default class Header extends React.Component {

  static propTypes = {
    enabled: React.PropTypes.bool,
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city),
    token: React.PropTypes.string,
    userID: React.PropTypes.string,
    handlers: React.PropTypes.object,
    simulations: React.PropTypes.array
  }

  handleCityChange(city) {
    this.props.handlers.handleCityChange(city._id);
  }
  
  _handleRequestAPIAccess(e) {
    e.preventDefault();
    this.props.handlers.handleRequestAPIAccess();
  }

  render() {
    const cities = this.props.availableCities || [];

    const userSimulations = this.props.simulations;

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
        <nav>
          <div className="nav-wrapper">
            <a className="brand-logo center" href="#">SAVN</a>
            <ul className="left hide-on-med-and-down">
              <li>
                <a href="#" className="btn waves-effect waves-light">Home</a>
              </li>
              <li>
                <Dropdown
                  enabled  = {this.props.enabled}
                  items    = {cities}
                  handlers = {dropdownHandlers}
                />
              </li>
              <li>
                <LoginButton
                  token      = {this.props.token}
                  activeUser = {this.props.activeUser}
                  handlers   = {loginButtonHandlers}
                />
              </li>
              <li>
                {
                  this.props.token ?
                    <SimulationList
                      simulations = {userSimulations}
                    /> : ''
                }
              </li>
            </ul>
            <ul className="right hide-on-med-and-down">
              <JoinSimulationForm
                handlers = {joinSimulationFormHandlers}
              />
            </ul>
          </div>
        </nav>
    )
  }
}