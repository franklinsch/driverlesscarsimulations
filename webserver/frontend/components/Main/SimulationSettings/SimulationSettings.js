import React from 'react';
import Dropdown from './Dropdown/Dropdown.jsx';
import UtilFunctions from '../../Utils/UtilFunctions.js';
import CustomPropTypes from '../../Utils/CustomPropTypes.js';
import JourneySettings from './JourneySettings/JourneySettings.js';

export default class SimulationSettings extends React.Component {
  static propTypes = {
    socket: React.PropTypes.object,
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city),
    selectedCity: CustomPropTypes.city,
    activeSimulationID: React.PropTypes.string
  }

  handleCityChange(city) {
    this.setState({
      selectedCity: city,
      journeys: []
    })
  }

  handleSimulationStart(e) {
    e.preventDefault();

    const socket = this.props.socket;
    const selectedCity = this.state && this.state.selectedCity || this.props.availableCities[0];

    const journeys = this.state.journeys;

    const simulationSettings = {
      selectedCity: selectedCity,
      journeys: journeys
    }

    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify({
        ...UtilFunctions.socketMessage(),
        type: "request-simulation-start",
        content: simulationSettings
      }))
    }
  }

  _handleJourneySubmit(journey) {
    const journeys = this.state.journeys;

    const newJourneys = journeys.concat([journey])

    this.setState({
      journeys: newJourneys
    })
  }

  render() {
    const cities = this.props.availableCities || [];

    return (
      <div>
        <Dropdown items={cities} onSelect={(city) => { this.handleCityChange(city) }} />
        <JourneySettings 
          onSubmit={(journey) => {this._handleJourneySubmit(journey)}}
        />
        <button onClick={ (e) => this.handleSimulationStart(e) }>Start simulation</button>
        { (this.props.activeSimulationID !== "0" ? <div>Current Simulation ID: { this.props.activeSimulationID }</div> : '') }
      </div>
    )
  }
}
