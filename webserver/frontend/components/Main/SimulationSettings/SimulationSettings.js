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
    mapSelectedJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    handlePositionPreview: React.PropTypes.func,
    handleCityChange: React.PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedCity: null,
      journeys: []
    }
  }

  handleCityChange(city) {
    this.setState({
      selectedCity: city,
      journeys: []
    })
    this.props.handleCityChange(city._id);
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
    console.log(selectedCity);
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

  _handleJourneysSubmit(journeys) {
    this.setState({
      journeys: this.state.journeys.concat(journeys)
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

  _handlePositionSelect(position) {
    const f = this.props.handlePositionPreview;
    if (!f) {
      return
    }

    f(position);
  }

  _handleExportClick() {
    const journeys = this.state.journeys;
    const data = JSON.stringify(journeys);

    const url = 'data:application/json;charset=utf-8,'+ encodeURIComponent(data);

    let exportFileDefaultName = 'journeys.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('target', '_blank');
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

    const selectedCity = this.state.selectedCity || cities[0];
    const bounds = selectedCity ? selectedCity.bounds : null;

    return (
      <div className="container">
        <Dropdown items={cities} onSelect={(city) => { this.handleCityChange(city) }} />
        <JourneySettings 
          handleJourneysSelect={(journeys) => {this._handleJourneysSubmit(journeys)}}
          handlePositionSelect={(position) => this._handlePositionSelect(position)}
          bounds={bounds}
        />
      <button className="btn btn-primary" onClick={ (e) => this.handleSimulationStart(e) }>Start simulation</button>
        {
          hasSimulationStarted &&
          <div>Current Simulation ID: { simID }</div>
        }
        <button className="btn btn-primary" hidden={!hasSimulationStarted} onClick={ (e) => this.handleSimulationUpdate(e) }>Update simulation</button>
        <JoinSimulationForm onSubmit={(simID) => {this._handleJoinSimulation(simID)}} />

        <h2> Journeys: </h2>
        { this.renderJourneysList() }
        <button onClick={() => this._handleExportClick()}>Export</button>
      </div>
    )
  }
}
