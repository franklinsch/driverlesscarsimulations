import React from "react"
import UtilFunctions from '../../Utils/UtilFunctions.js';
import CustomPropTypes from '../../Utils/CustomPropTypes.js';
import JourneySettings from './JourneySettings/JourneySettings.js';
import JourneyList from './JourneyList/JourneyList.js';
import SpeedSetting from './SpeedSetting/SpeedSetting.js';

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

  _handleBenchmarkRequest(e) {
    e.preventDefault();
    const socket = this.props.socket;
    
    const simID = this.props.activeSimulationID;
    const hasSimulationStarted = simID !== "0";  

    if (!hasSimulationStarted) {
      console.error("Tried to update a simulation that hasn't started");
      return
    }
    const type = "request-simulation-benchmark";
    const content = {
      simulationID: simID
    }
    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  handleJourneysSubmit(journeys) {
    this.setState({
      journeys: this.state.journeys.concat(journeys)
    })
  }

  handlePositionSelect(position) {
    const f = this.props.handlers.handlePositionPreview;
    if (!f) {
      return
    }

    f(position);
  }

  render() {
    const simID = this.props.activeSimulationID;
    const hasSimulationStarted = simID !== "0";

    const socket = this.props.socket;
    const selectedCity = this.props.selectedCity;
    const bounds = selectedCity ? selectedCity.bounds : null;
    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);
    const benchmarkValue = this.props.benchmarkValue;

    const journeySettingsHandlers = {
      handleJourneysSelect: ::this.handleJourneysSubmit,
      handlePositionSelect: ::this.handlePositionSelect,
      handleObjectCreate: this.props.handlers.handleObjectTypeCreate
    }

    const speedSettingHandlers = {
      handleSpeedChange: this.props.handlers.handleSpeedChange
    }

    return (
      <div className="container">
        <JourneyList journeys={allJourneys}/>
        <JourneySettings 
          bounds={bounds}
          journeys={allJourneys}
          objectTypes={this.props.objectTypes}
          objectKindInfo={this.props.objectKindInfo}
          handlers={journeySettingsHandlers}
        />
        <div className="row">
          <button className="btn btn-primary" onClick={ (e) => this._handleSimulationButton(e, hasSimulationStarted) }>
            { hasSimulationStarted  && <p>End Simulation</p> || <p>Start simulation</p>}
          </button>
            {
              hasSimulationStarted &&
              <div>Current Simulation ID: { simID }</div>
            }
          <button className="btn btn-primary" hidden={!hasSimulationStarted} onClick={ (e) => this._handleSimulationUpdate(e) }>Update simulation</button>
          <SpeedSetting 
            hidden={!hasSimulationStarted}
            socket={socket}
            handlers={speedSettingHandlers}
          />

          <button className="btn btn-primary" hidden={!hasSimulationStarted} onClick={ (e) => this._handleBenchmarkRequest(e) }>Request benchmark</button>
          <p hidden={!benchmarkValue}>{benchmarkValue} is the average speed to destination in s/m</p>
        </div>
      </div>
    )
  }
}
