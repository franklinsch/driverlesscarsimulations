import React from 'react';
import Dropdown from './Dropdown/Dropdown.jsx';
import UtilFunctions from '../../Utils/UtilFunctions.js';
import CustomPropTypes from '../../Utils/CustomPropTypes.js';

export default class SimulationSettings extends React.Component {
  static propTypes = {
    socket: React.PropTypes.object,
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city)
  }

  constructor(props) {
    super(props)
    const socket = props.socket;

    if (socket && socket.readyState === 1) {
      socket.send({
        ...UtilFunctions.socketMessage(),
        type:"request-available-cities"
      })
    }
  }

  handleCityChange(city) {
    const socket = this.state.socket;

    if (socket && socket.readyState === 1) {
      socket.send({
        ...UtilFunctions.socketMessage(),
        type: "simulation-info",
        content: simulationInfo
      });
    }
  }

  render() {
    const cities = this.props.availableCities || [];

    console.log(cities);

    return (
      <Dropdown items={cities} onSelect={(city) => { this.handleCityChange(city) }} />
    )
  }
}
