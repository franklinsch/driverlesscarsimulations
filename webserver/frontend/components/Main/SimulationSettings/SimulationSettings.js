import React from 'react';
import UtilFunctions from '../../Utils/UtilFunctions.js';
import CustomPropTypes from '../../Utils/CustomPropTypes.js';
import JourneySettings from './JourneySettings/JourneySettings.js';
import JourneyList from './JourneyList/JourneyList.js';

export default class SimulationSettings extends React.Component {
  static propTypes = {
    socket: React.PropTypes.object,
    selectedCity: CustomPropTypes.city,
    activeSimulationID: React.PropTypes.string,
    mapSelectedJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    handlePositionPreview: React.PropTypes.func,
    handleCityChange: React.PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      journeys: []
    }
  }

  handleSimulationStart(e) {
    e.preventDefault();

    const socket = this.props.socket;
    const selectedCity = this.props.selectedCity;

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
    const selectedCity = this.props.selectedCity;

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

  _handlePositionSelect(position) {
    const f = this.props.handlePositionPreview;
    if (!f) {
      return
    }

    f(position);
  }

  render() {
    const simID = this.props.activeSimulationID;
    const hasSimulationStarted = simID !== "0";

    const selectedCity = this.props.selectedCity;
    const bounds = selectedCity ? selectedCity.bounds : null;
    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);

    return (
      <div className="container">
        <JourneyList journeys={allJourneys}/>
        <JourneySettings 
          handleJourneysSelect={(journeys) => {this._handleJourneysSubmit(journeys)}}
          handlePositionSelect={(position) => this._handlePositionSelect(position)}
          bounds={bounds}
          journeys={allJourneys}
        />
        <div className="row">
          <button className="btn btn-primary" onClick={ (e) => this.handleSimulationStart(e) }>Start simulation</button>
            {
              hasSimulationStarted &&
              <div>Current Simulation ID: { simID }</div>
            }
            <button className="btn btn-primary" hidden={!hasSimulationStarted} onClick={ (e) => this.handleSimulationUpdate(e) }>Update simulation</button>
        </div>
      </div>
    )
  }
}
