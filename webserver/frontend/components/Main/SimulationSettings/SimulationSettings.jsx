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
      this.props.handlers.handleSimulationClose();
    } else {
      const journeys = this.state.journeys || [];
      const allJourneys = journeys.concat(this.props.mapSelectedJourneys);

      this.props.handlers.handleSimulationStart(allJourneys);
    }
  }

  _handleSimulationUpdate(e) {
    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);

    this.props.handlers.handleSimulationUpdate(allJourneys);
  }

  _handleBenchmarkRequest(e) {
    e.preventDefault();

    this.props.handlers.handleBenchmarkRequest();
  }

  handleJourneysSubmit(journeys) {
    this.setState({
      journeys: this.state.journeys.concat(journeys)
    })
  }

  render() {
    const simID = this.props.activeSimulationID;
    const hasSimulationStarted = simID !== "0";

    const selectedCity = this.props.selectedCity;
    const bounds = selectedCity ? selectedCity.bounds : null;
    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);

    const benchmarkValue = this.props.benchmarkValue;

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
            { hasSimulationStarted  && 
              <p>End Simulation</p> || <p>Start simulation</p>
            }
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
}
