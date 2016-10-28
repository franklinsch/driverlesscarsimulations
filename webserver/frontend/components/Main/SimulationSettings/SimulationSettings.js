import React from 'react';
import Dropdown from './Dropdown/Dropdown.jsx';
import UtilFunctions from '../../Utils/UtilFunctions.js';
import CustomPropTypes from '../../Utils/CustomPropTypes.js';
import JourneySettings from './JourneySettings/JourneySettings.js';
import JoinSimulationForm from './JoinSimulationForm/JoinSimulationForm.js';

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

    const type = "request-simulation-start";
    const content = simulationSettings;

    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  handleSimulationUpdate(e) {
    e.preventDefault();

    const socket = this.props.socket;
    const selectedCity = this.state && this.state.selectedCity || this.props.availableCities[0];

    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);

    const simID = this.props.activeSimulationID;
    const hasSimulationStarted = simID !== "0";

    if (!hasSimulationStarted) {
      console.error("Tried to update a simulation that hasn't started");
      return
    }

    const type = "request-simulation-update";
    const content = {
      simulationID: simID,
      journeys: allJourneys
    }

    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  _handleJourneySubmit(journeys) {
    this.setState({
      journeys: journeys
    })
  }

  _handleJoinSimulation(simulationID) {
    const socket = this.props.socket;

    const type = "request-simulation-join";
    const content = {
      simulationID: simulationID
    }

    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  renderJourneysList() {
    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);

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

  render() {
    const cities = this.props.availableCities || [];

    const simID = this.props.activeSimulationID;
    const hasSimulationStarted = simID !== "0";

    return (
      <div>
        <Dropdown items={cities} onSelect={(city) => { this.handleCityChange(city) }} />
        <JourneySettings
          onSubmit={(journeys) => {this._handleJourneySubmit(journeys)}}
        />
      <button className="btn btn-primary" onClick={ (e) => this.handleSimulationStart(e) }>Start simulation</button>
        {
          hasSimulationStarted &&
          <div>Current Simulation ID: { simID }</div>
        }
        <button hidden={!hasSimulationStarted} onClick={ (e) => this.handleSimulationUpdate(e) }>Update simulation</button>
        <JoinSimulationForm onSubmit={(simID) => {this._handleJoinSimulation(simID)}} />

        <h2> Journeys: </h2>
        { this.renderJourneysList() }
      </div>
    )
  }
}
