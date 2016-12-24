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
          <a className="brand-logo" href="#">SAVN</a>
          <ul className="nav navbar-nav">
            <li className="nav-item active">
              <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item">
              <Dropdown
                enabled  = {this.props.enabled}
                items    = {cities}
                handlers = {dropdownHandlers}
              />
            </li>
            <li className="nav-item">
              <LoginButton
                token      = {this.props.token}
                activeUser = {this.props.activeUser}
                handlers   = {loginButtonHandlers}
              />
            </li>
            <li className="nav-item">
              {
                this.props.token ?
                  <SimulationList
                    simulations = {userSimulations}
                  /> : ''
              }
            </li>
            <li className="nav-item">
              {
                this.props.token ?
                  <button 
                    onClick={::this._handleRequestAPIAccess}
                    className ="btn btn-default">
                      Request API Access
                  </button>
                  : ''
              }
            </li>
          </ul>
          <JoinSimulationForm
            handlers = {joinSimulationFormHandlers}
          />
        </div>
      </nav>
    )
  }
}
// <nav>
//   <div class="nav-wrapper">
//     <a href="#!" class="brand-logo">Logo</a>
//     <a href="#" data-activates="mobile-demo" class="button-collapse"><i class="material-icons">menu</i></a>
//     <ul class="right hide-on-med-and-down">
//       <li><a href="sass.html">Sass</a></li>
//       <li><a href="badges.html">Components</a></li>
//       <li><a href="collapsible.html">Javascript</a></li>
//       <li><a href="mobile.html">Mobile</a></li>
//     </ul>
//     <ul class="side-nav" id="mobile-demo">
//       <li><a href="sass.html">Sass</a></li>
//       <li><a href="badges.html">Components</a></li>
//       <li><a href="collapsible.html">Javascript</a></li>
//       <li><a href="mobile.html">Mobile</a></li>
//     </ul>
//   </div>
// </nav>
//