import React from 'react';
import UtilFunctions from '../../Utils/UtilFunctions.jsx';
import CustomPropTypes from '../../Utils/CustomPropTypes.jsx';
import JourneySettings from './JourneySettings/JourneySettings.jsx';
import JourneyList from './JourneyList/JourneyList.jsx';
import SpeedSetting from './SpeedSetting/SpeedSetting.jsx';

export default class SimulationSettings extends React.Component {
  static propTypes = {
    activeSimulationID: React.PropTypes.string,
    selectedCity: CustomPropTypes.city,
    simulationJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    pendingJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    objectTypes: React.PropTypes.arrayOf(CustomPropTypes.typeInfo),
    objectKindInfo: React.PropTypes.arrayOf(CustomPropTypes.kindInfo),
    handlers: React.PropTypes.object
  }

  _handleSimulationButton(e, started) {
    e.preventDefault();

    if (started) {
      this.props.handlers.handleSimulationClose();
    } else {
      this.props.handlers.handleSimulationStart();
    }
  }

  _handleSimulationUpdate(e) {
    this.props.handlers.handleSimulationUpdate();
  }

  _handleBenchmarkRequest(e) {
    e.preventDefault();

    this.props.handlers.handleBenchmarkRequest();
  }

  handleJourneysSubmit(journeys) {
    for (const journey of journeys) {
      this.props.handlers.handlePendingJourneyAdd(journey);
    }
  }

  render() {
    const simID = this.props.activeSimulationID;
    const hasSimulationStarted = simID !== "0";

    const selectedCity = this.props.selectedCity;
    const bounds = selectedCity ? selectedCity.bounds : null;
    const simulationJourneys = this.props.simulationJourneys || [];
    const pendingJourneys = this.props.pendingJourneys || [];

    const benchmarkValue = this.props.benchmarkValue;

    const journeyListHandlers = {
      handleJourneyMouseOver : this.props.handlers.handleJourneyListItemMouseOver,
      handleJourneyMouseOut  : this.props.handlers.handleJourneyListItemMouseOut
    }

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
          pendingJourneys     = {pendingJourneys}
          simulationJourneys  = {simulationJourneys}
          handlers            = {journeyListHandlers}
        />
        <JourneySettings
          bounds              = {bounds}
          simulationJourneys  = {simulationJourneys}
          pendingJourneys     = {pendingJourneys}
          objectTypes         = {this.props.objectTypes}
          objectKindInfo      = {this.props.objectKindInfo}
          handlers            = {journeySettingsHandlers}
        />
      <div id="simulation-buttons" className="row">
          <button
            className = "btn btn-primary"
            onClick   = {(e) => this._handleSimulationButton(e, hasSimulationStarted)}
          >
            { hasSimulationStarted  &&
              <p>End Simulation</p> || <p>Start simulation</p>
            }
          </button>

          {
            hasSimulationStarted &&
            <div>Started simulation's ID: { simID }</div>
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
            handlers = {speedSettingHandlers}
          />

          <button
            className = "btn btn-primary"
            hidden    = {!hasSimulationStarted}
            onClick   = {::this._handleBenchmarkRequest}
          >
            Request benchmark
          </button>
          <p hidden={benchmarkValue == undefined}>
          {benchmarkValue} is the average speed to destination in km/s
          </p>
        </div>
      </div>
    )
  }
