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
    activeSimulationID: React.PropTypes.string,
    mapSelectedJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney)
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedCity: [],
      journeys: []
    }
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

    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);

    const simulationSettings = {
      selectedCity: selectedCity,
      journeys: allJourneys
    }

    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify({
        ...UtilFunctions.socketMessage(),
        type: "request-simulation-start",
        content: simulationSettings
      }))
    }
  }

  _handleJourneySubmit(journeys) {
    this.setState({
      journeys: journeys
    })
  }

  renderJourneysList() {
    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);

    console.log(allJourneys);

    return (
      <ul>
      {
        allJourneys.map((journey, index) => {
          return (
            <li key={index}> { index + ": (" + journey.origin.lat + ", " + journey.origin.lng + ") -> (" + journey.destination.lat + ", " + journey.destination.lng + ")" } </li>)
        })
      }
      </ul>
    )
  }



  render() { const cities = this.props.availableCities || [];

    return (
      <div>
        <Dropdown items={cities} onSelect={(city) => { this.handleCityChange(city) }} />
        <JourneySettings 
          onSubmit={(journeys) => {this._handleJourneySubmit(journeys)}}
        />
        <button onClick={ (e) => this.handleSimulationStart(e) }>Start simulation</button>
        { (this.props.activeSimulationID !== "0" ? <div>Current Simulation ID: { this.props.activeSimulationID }</div> : '') }

        <h2> Journeys: </h2>
        { this.renderJourneysList() }
      </div>
    )
  }
}
