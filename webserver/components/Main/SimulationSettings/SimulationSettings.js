import React from 'react';
import Dropdown from './Dropdown/Dropdown.jsx';
import UtilFunctions from '../../Utils/UtilFunctions.js';
import CustomPropTypes from '../../Utils/CustomPropTypes.js';

export default class SimulationSettings extends React.Component {
  static propTypes = {
    socket: React.PropTypes.object,
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city),
    selectedCity: CustomPropTypes.city
  }

  handleCityChange(city) {
    this.setState({
      selectedCity: city
    })
  }

  handleSimulationStart() {
    const socket = this.props.socket;
    const selectedCity = this.state && this.state.selectedCity || this.props.availableCities[0];

    const simulationSettings = {
      selectedCity: selectedCity
    }

    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify({
        ...UtilFunctions.socketMessage(),
        type: "request-simulation-start",
        content: simulationSettings
      }))
    }

  }

  render() {
    const cities = this.props.availableCities || [];

    return (
      <div>
        <Dropdown items={cities} onSelect={(city) => { this.handleCityChange(city) }} />
        <button onClick={ () => this.handleSimulationStart() }>Start simulation</button>
      </div>
    )
  }
}
