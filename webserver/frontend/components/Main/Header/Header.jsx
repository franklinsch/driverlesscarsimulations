import React from 'react';
import CustomPropTypes from '../../Utils/CustomPropTypes.jsx';
import Dropdown from './Dropdown/Dropdown.jsx';
import JoinSimulationForm from './JoinSimulationForm/JoinSimulationForm.jsx';
import LoginButton from './LoginButton/LoginButton.jsx';
import SimulationList from './SimulationList/SimulationList.jsx';
import UtilFunctions from '../../Utils/UtilFunctions.jsx';

export default class Header extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      simulations: []
    }
  }
  static propTypes = {
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city),
    token: React.PropTypes.string,
    userID: React.PropTypes.string,
    handlers: React.PropTypes.object
  }

  handleCityChange(city) {
    this.props.handlers.handleCityChange(city._id);
  }

  componentWillReceiveProps() {
    if (this.props.token) {
      const url = '/simulations';
      fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })
      .then((response) => {
        response.json().then((data) => {
          this.setState({ simulations: data.simulations });
        });
      })
    }
  }

  render() {
    const cities = this.props.availableCities || [];

    const userSimulations = this.state.simulations;

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
            <li className="nav-item">
              {
                this.props.token ? <SimulationList simulations = { userSimulations } /> : ''
              }
            </li>
          </ul>
          <JoinSimulationForm
            handlers = {joinSimulationFormHandlers}
          />
      </nav>
    )
  }
}
