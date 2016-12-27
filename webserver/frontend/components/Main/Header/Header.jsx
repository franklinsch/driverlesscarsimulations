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

  componentDidMount() {
    $('ul.tabs').tabs();

  }

  componentDidUpdate() {
    $('ul.tabs').tabs();
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
      <div>
        <ul className="side-nav fixed">
          <a className="brand-logo center" href="#">SAVN</a>
          <li>
            <div className="row">
                <ul className="tabs">
                  <li className="tab col s3"><a href="#test1">Test 1</a></li>
                  <li className="tab col s3"><a class="active" href="#test2">Test 2</a></li>
                  <li className="tab col s3 disabled"><a href="#test3">Disabled Tab</a></li>
                  <li className="tab col s3"><a href="#test4">Test 4</a></li>
                </ul>
              </div>
              <div id="test1" className="col s12">Test 1</div>
              <div id="test2" className="col s12">Test 2</div>
              <div id="test3" className="col s12">Test 3</div>
              <div id="test4" className="col s12">Test 4</div>
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
          <li>
            <JoinSimulationForm
              handlers = {joinSimulationFormHandlers}
            />
          </li>
        </ul>
      </div>
    )
  }
}