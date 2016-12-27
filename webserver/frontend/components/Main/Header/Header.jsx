import React from "react";
import CustomPropTypes from "../../Utils/CustomPropTypes.jsx";
import Dropdown from "./Dropdown/Dropdown.jsx";
import JoinSimulationForm from "./JoinSimulationForm/JoinSimulationForm.jsx";
import LoginButton from "./LoginButton/LoginButton.jsx";
import SimulationList from "./SimulationList/SimulationList.jsx";

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
    $('.tooltipped').tooltip({delay: 50});


  }

  componentDidUpdate() {
    $('ul.tabs').tabs();
    $('.tooltipped').tooltip({delay: 50});

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
          <li>
            <a className="brand-logo center" href="#">SAVN</a>
          </li>
          <li>
            <div className="row">
              <div className="col s12">
                <ul className="tabs">
                  <li className="tab col s3">
                    <a className="tooltipped" data-position="top" data-delay="50" data-tooltip="account" href="#account">
                      <span className="center-align">
                        <i className="material-icons">account_box</i>
                    </span>
                    </a>
                  </li>
                  <li className="tab col s3">
                    <a className="tooltipped" data-position="top" data-delay="50" data-tooltip="simulation settings" href="#settings">
                      <span className="center-align">
                        <i className="material-icons">settings</i>
                    </span>
                    </a>
                  </li>
                  <li className="tab col s3">
                    <a className="tooltipped" data-position="top" data-delay="50" data-tooltip="create journeys"  href="#journeys">
                      <span className="center-align">
                        <i className="material-icons">directions_car</i>
                    </span>
                    </a>
                  </li>
                  <li className="tab col s3">
                    <a  className="tooltipped" data-position="top" data-delay="50" data-tooltip="run simulation" href="#run">
                      <span className="center-align">
                        <i className="material-icons">play_arrow</i>
                    </span>
                    </a>
                  </li>
                </ul>
              </div>
              <div id="account" className="col s12">
                <LoginButton
                  token      = {this.props.token}
                  activeUser = {this.props.activeUser}
                  handlers   = {loginButtonHandlers}
                />
              </div>
              <div id="settings" className="col s12">
                <Dropdown
                  enabled  = {this.props.enabled}
                  items    = {cities}
                  handlers = {dropdownHandlers}
                />
              </div>
              <div id="journeys" className="col s12">Test 3</div>
              <div id="run" className="col s12">Test 3</div>
            </div>
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