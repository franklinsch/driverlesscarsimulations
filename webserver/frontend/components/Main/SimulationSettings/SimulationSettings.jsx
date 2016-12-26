import React from "react";
import CustomPropTypes from "../../Utils/CustomPropTypes.jsx";
import JourneySettings from "./JourneySettings/JourneySettings.jsx";
import JourneyList from "./JourneyList/JourneyList.jsx";
import SpeedSetting from "./SpeedSetting/SpeedSetting.jsx";
import ScrubTimer from './ScrubTimer/ScrubTimer.jsx'

export default class SimulationSettings extends React.Component {
  static propTypes = {
    activeSimulationID: React.PropTypes.string,
    simulationState: CustomPropTypes.simulationState.isRequired,
    selectedCity: CustomPropTypes.city,
    simulationJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    pendingJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    objectTypes: React.PropTypes.arrayOf(CustomPropTypes.typeInfo),
    objectKindInfo: React.PropTypes.arrayOf(CustomPropTypes.kindInfo),
    handlers: React.PropTypes.object
  }


  constructor(props) {
    super(props);
    this.state = {
      useRealData: false,
      realWorldJourneyNum: 0,
      journeys: [],
      allowSimulationStart: true,
      hotspotFile: null,
    }
  }

  _handleFileUpload(e) {
    this.setState({hotspotFile: e.target.files[0]});
  }

  _handleRealDataCheckboxChange(e) {
    this.setState({useRealData: !this.state.useRealData});
  }

  _handleRealWorldJourneyNumChange(e) {
    this.setState({realWorldJourneyNum: e.target.value});
  }

  _handleSimulationButton(e, started) {
    e.preventDefault();

    if (started) {
      this.props.handlers.handleSimulationClose();

      const path = window.location.pathname;
      if (/^\/simulations\/([a-z]|[0-9])+/.test(path)) {
        this.setState({
          allowSimulationStart: false
        })
      }
    } else {
      this.props.handlers.handleSimulationStart(this.state.useRealData, this.state.realWorldJourneyNum, this.state.hotspotFile);
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
    const currentSpeed = this.props.currentSpeed;

    const allowSimulationStart = this.state.allowSimulationStart;

    const journeyListHandlers = {
      handleJourneyMouseOver : this.props.handlers.handleJourneyListItemMouseOver,
      handleJourneyMouseOut  : this.props.handlers.handleJourneyListItemMouseOut
    };
    const usingRealData = this.state.useRealData;

    const journeySettingsHandlers = {
      handleJourneysFileImport : ::this.handleJourneysSubmit,
      handlePositionAdd        : this.props.handlers.handlePositionSelect,
      handleObjectCreate       : this.props.handlers.handleObjectTypeCreate
    };

    const speedSettingHandlers = {
      handleSpeedChange : this.props.handlers.handleSpeedChange
    };

    const scrubHandlers = {
      handlePause         : ::this.props.handlers.handlePause,
      handleResume        : ::this.props.handlers.handleResume,
      handleScrub         : ::this.props.handlers.handleScrub
    }

    return (
      <div>
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
          activeSimulationID  = {simID}
        />
        <div className="row">
          <input
            type     = "checkbox"
            id       = "real-data"
            disabled = {hasSimulationStarted}
            onChange = {::this._handleRealDataCheckboxChange}
          />
          <label htmlFor="real-data"> Use real world data </label>
          {
            usingRealData &&
            <form>
              <div className="input-field">
                <input
                  type="number"
                  placeholder="Number of real world journeys"
                  name="journey-number"
                  disabled={hasSimulationStarted}
                  onChange={::this._handleRealWorldJourneyNumChange}
                />
              </div>
              <div className="file-field input-field">
                <div className="btn waves-effect waves-light">
                  <span>Upload Hotspots</span>
                  <input type="file" onChange={::this._handleFileUpload}/>
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path validate" type="text"/>
                </div>
              </div>
            </form>
          }
        </div>
        <div className="row">
        <button
          className = "btn waves-effect waves-light"
          disabled  = {!allowSimulationStart}
          onClick   = {(e) => this._handleSimulationButton(e, hasSimulationStarted)}
        >
          { !allowSimulationStart &&
          <span>Simulation Ended</span> || hasSimulationStarted  &&
          <span>End Simulation</span> || <span>Start simulation</span>
          }
        </button>
          </div>
        <p>Current simulation ID: {simID}</p>
        {
          simID !== '0' ?
            <button
              className = "btn waves-effect waves-light"
              hidden    = {!simID}
              onClick   = {(e) => this.props.handlers.handleSimulationActivate(simID)}
            >
              Activate simulation
            </button>
            :
            ''
        }
        <ScrubTimer
          timestamp          = {this.props.simulationState.timestamp}
          latestTimestamp    = {this.props.simulationState.latestTimestamp}
          handlers           = {scrubHandlers}
        />
        <button
          id        = "update-button"
          className = "btn waves-effect waves-light"
          hidden    = {!hasSimulationStarted}
          onClick   = {::this._handleSimulationUpdate}
        >
          Update simulation
        </button>

        <div className="row">
          <SpeedSetting
            currentSpeed = {currentSpeed}
            hidden   = {!hasSimulationStarted}
            handlers = {speedSettingHandlers}
          />
        </div>
        <button
          className = "btn waves-effect waves-light"
          hidden    = {!hasSimulationStarted && allowSimulationStart}
          onClick   = {::this._handleBenchmarkRequest}
        >
          Request benchmark
        </button>
        <p hidden={benchmarkValue == undefined}>
          {benchmarkValue} is the average speed to destination in km/s
        </p>
      </div>
    )
  }
}
