import React from 'react';
import UtilFunctions from '../../Utils/UtilFunctions.jsx';
import CustomPropTypes from '../../Utils/CustomPropTypes.jsx';
import JourneySettings from './JourneySettings/JourneySettings.jsx';
import JourneyList from './JourneyList/JourneyList.jsx';
import SpeedSetting from './SpeedSetting/SpeedSetting.jsx';

export default class SimulationSettings extends React.Component {
  static propTypes = {
    socket: React.PropTypes.object,
    activeSimulationID: React.PropTypes.string,
    selectedCity: CustomPropTypes.city,
    mapSelectedJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    objectTypes: React.PropTypes.arrayOf(CustomPropTypes.typeInfo),
    objectKindInfo: React.PropTypes.arrayOf(CustomPropTypes.kindInfo),
    handlers: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      journeys: []
    }
  }

  _handleSimulationButton(e, started) {
    e.preventDefault();
    if (started) {
      this._handleSimulationClose();
    } else {
      this._handleSimulationStart()
    }
  }

  _handleSimulationClose() {
    const socket = this.props.socket;
    const simID = this.props.activeSimulationID;
    const type = "request-simulation-close";
    const content = {
      simulationID: simID
    }
    UtilFunctions.sendSocketMessage(socket, type, content); 
  }

  _handleSimulationStart() {
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

  _handleSimulationUpdate(e) {
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

  handleJourneysSubmit(journeys) {
    this.setState({
      journeys: this.state.journeys.concat(journeys)
    })
  }

  render() {
    const simID = this.props.activeSimulationID;
    const hasSimulationStarted = simID !== "0";

    const socket = this.props.socket;
    const selectedCity = this.props.selectedCity;
    const bounds = selectedCity ? selectedCity.bounds : null;
    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);

    const journeySettingsHandlers = {
      handleJourneysFileImport : ::this.handleJourneysSubmit,
      handlePositionAdd        : this.props.handlers.handlePositionSelect,
      handleObjectCreate       : this.props.handlers.handleObjectTypeCreate
    }

    const speedSettingHandlers = {
      handleSpeedChange : this.props.handlers.handleSpeedChange
    }

    return (
      <div className="container">
        <JourneyList 
          journeys = {allJourneys}
        />
        <JourneySettings 
          bounds         = {bounds}
          journeys       = {allJourneys}
          objectTypes    = {this.props.objectTypes}
          objectKindInfo = {this.props.objectKindInfo}
          handlers       = {journeySettingsHandlers}
        />
        <div className="row">
          <button 
            className = "btn btn-primary" 
            onClick   = {(e) => this._handleSimulationButton(e, hasSimulationStarted)}
          >
            { hasSimulationStarted  && <p>End Simulation</p> || <p>Start simulation</p>}
          </button>

          {
            hasSimulationStarted &&
            <div>Current Simulation ID: { simID }</div>
          }

          <button 
            className = "btn btn-primary"
            hidden    = {!hasSimulationStarted}
            onClick   = {::this._handleSimulationUpdate}
          >
            Update simulation
          </button>

          <SpeedSetting 
            hidden   = {!hasSimulationStarted}
            socket   = {socket}
            handlers = {speedSettingHandlers}
          />
        </div>
      </div>
    )
  }
}
