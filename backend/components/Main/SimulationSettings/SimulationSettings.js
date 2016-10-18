import React from 'react';
import Dropdown from './Dropdown/Dropdown.jsx';
import UtilFunctions from '../../Utils/UtilFunctions.js';
import CustomPropTypes from '../../Utils/CustomPropTypes.js';

export default class SimulationSettings extends React.Component {
  static propTypes = {
    socket: React.PropTypes.object,
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city)
  }

  handleCityChange(city) {
    const socket = this.props.socket;

    if (socket && socket.readyState === 1) {
      socket.send({
        ...UtilFunctions.socketMessage(),
        type: "simulation-info",
        content: simulationInfo
      });
    }
  }

  handleSimulationStart() {

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
