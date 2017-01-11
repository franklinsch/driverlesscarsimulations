import React from "react";
import CustomPropTypes from "../../Utils/CustomPropTypes.jsx";
import Dropdown from "./Dropdown/Dropdown.jsx";
import JoinSimulationForm from "./JoinSimulationForm/JoinSimulationForm.jsx";
import SimulationList from "./SimulationList/SimulationList.jsx";
import JourneyList from "./JourneyList/JourneyList.jsx";
import JourneySettings from "./JourneySettings/JourneySettings.jsx";
import SpeedSetting from "./SpeedSetting/SpeedSetting.jsx";
import ScrubTimer from "./ScrubTimer/ScrubTimer.jsx";

export default class ControlPanel extends React.Component {

  static propTypes = {
    enabled: React.PropTypes.bool,
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city),
    token: React.PropTypes.string,
    userID: React.PropTypes.string,
    handlers: React.PropTypes.object,
    simulations: React.PropTypes.array,
    frameworks: React.PropTypes.array,
    simulationJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    pendingJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    activeSimulationID: React.PropTypes.string,
    simulationState: CustomPropTypes.simulationState.isRequired,
    selectedCity: CustomPropTypes.city,
    objectTypes: React.PropTypes.arrayOf(CustomPropTypes.typeInfo),
    objectKindInfo: React.PropTypes.arrayOf(CustomPropTypes.kindInfo),
  }

  constructor(props) {
    super(props);
    this.state = {
      useRealData: false,
      realWorldJourneyNum: 0,
      journeys: [],
      allowSimulationStart: true,
      hotspotFile: null,
      showJourneyPanel: false,
      showSimulationPanel: false
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
      this.props.handlers.handleDisconnectFrameworks();

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

  handleCityChange(city) {
    this.props.handlers.handleCityChange(city._id);
  }

  componentDidMount() {
    $('ul.tabs').tabs();
    $('.tooltipped').tooltip({delay: 50});
    $("#journey-button").sideNav({
      edge: 'right'
    });
    $("#simulation-button").sideNav({
      edge: 'right'
    });
  }

  componentDidUpdate(prevProps, prevState) {
    $('ul.tabs').tabs();
    $('.tooltipped').tooltip({delay: 50});

    if (this.state.showSimulationPanel != prevState.showSimulationPanel) {
      if (this.state.showSimulationPanel) {
        $('#simulation-button').sideNav('show');
      }
      else {
        $('#simulation-button').sideNav('hide');
      }
    }

    if (this.state.showJourneyPanel != prevState.showJourneyPanel) {
      if (this.state.showJourneyPanel) {
        $('#journey-button').sideNav('show');
      }
      else {
        $('#journey-button').sideNav('hide');
      }
    }

    if (this.props.activeSimulationID != prevProps.activeSimulationID) {
      if (this.props.activeSimulationID == "0") {
        this.setState({
            showSimulationPanel: false,
            showJourneyPanel: false
        })
      }
    }
  }

  _handleJourneyButton() {
    if (!this.state.showJourneyPanel) {
      this.setState({
          showSimulationPanel: false,
      });
    }

    this.setState({
      showJourneyPanel: !this.state.showJourneyPanel
    })
  }

  _handleSimulationSettingsButton() {
    if (!this.state.showSimulationPanel) {
      this.setState({
          showJourneyPanel: false,
      });
    }

    this.setState({
      showSimulationPanel: !this.state.showSimulationPanel
    })
  }

  render() {
    const cities = this.props.availableCities || [];
    const simulationJourneys = this.props.simulationJourneys || [];
    const pendingJourneys = this.props.pendingJourneys || [];
    const userSimulations = this.props.simulations;
    const selectedCity = this.props.selectedCity;
    const bounds = selectedCity ? selectedCity.bounds : null;
    const simID = this.props.activeSimulationID;
    const hasSimulationStarted = simID !== "0";
    const benchmarkValues = this.props.benchmarkValues;
    const currentSpeed = this.props.currentSpeed;
    const allowSimulationStart = this.state.allowSimulationStart;
    const usingRealData = this.state.useRealData;

    const journeySettingsHandlers = {
      handleJourneysFileImport : ::this.handleJourneysSubmit,
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

    const dropdownHandlers = {
      handleSelect : ::this.handleCityChange
    }

    const joinSimulationFormHandlers = {
      handleSubmit : this.props.handlers.handleJoinSimulation
    }

    const journeyListHandlers = {
      handleJourneyMouseOver : this.props.handlers.handleJourneyListItemMouseOver,
      handleJourneyMouseOut  : this.props.handlers.handleJourneyListItemMouseOut
    };

    const names = {};
    if (benchmarkValues) {
      this.props.frameworks.forEach(function(framework) {
        names[framework._id] = framework.name || 'Framework';
      });
    }

    return (
      <div>
        <nav className="bottom-nav">
          <div className="nav-wrapper z-depth-3">
              {
                hasSimulationStarted ?
                  <div className="row">
                    <div className="col s3">
                      <strong>Simulation ID</strong>: {simID}
                    </div>
                    <div className="col s3">
                      <ScrubTimer
                        timestamp          = {this.props.simulationState.timestamp}
                        latestTimestamp    = {this.props.simulationState.latestTimestamp}
                        handlers           = {scrubHandlers}
                      />
                    </div>
                    <div className="col s6">
                      <ul className="right">
                        <li>
                          <a
                            className = "btn  waves-effect waves-light"
                            onClick   = {(e) => this._handleJourneyButton(e)}
                          >
                            <span>Journeys</span>
                          </a>
                        </li>
                        <li>
                          <a
                              className = "btn  waves-effect waves-light"
                              onClick   = {(e) => this._handleSimulationSettingsButton(e)}
                            >
                            <span>Simulation Settings</span>
                          </a>
                        </li>
                        <li>
                          <a
                              className = "btn  waves-effect waves-light"
                              href="#/"
                            >
                            <span>Exit Simulation</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                :
                  <div className="row">
                    <div className="col s4">
                      <JoinSimulationForm
                        handlers = {joinSimulationFormHandlers}
                      />
                    </div>
                    <div className="col s8">
                      <ul className="right">
                        <li>
                          <Dropdown
                            enabled  = {this.props.enabled}
                            items    = {cities}
                            handlers = {dropdownHandlers}
                          />
                        </li>
                        <li>
                          <a
                            className = "btn  waves-effect waves-light"
                            onClick   = {(e) => this._handleJourneyButton(e)}
                          >
                            <span>Journeys</span>
                          </a>
                        </li>
                        <li>
                          <a
                              className = "btn  waves-effect waves-light"
                              onClick   = {(e) => this._handleSimulationButton(e, hasSimulationStarted)}
                            >
                            <span>Start new Simulation</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
              }
          </div>
        </nav>

        <a id="journey-button" href="#" data-activates="journey-slide-out" hidden><i className="material-icons">menu</i></a>
        <a id="simulation-button" href="#" data-activates="simulation-slide-out" hidden><i className="material-icons">menu</i></a>

        <ul id ="journey-slide-out" className="side-nav">
          <div id="journeys" className="col s12">
            <div className="row">
              <h5>Journeys and Object Types</h5>
            </div>
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
            <button
              id        = "update-button"
              className = "btn waves-effect waves-light"
              onClick   = {::this._handleSimulationUpdate}
              style     = {!hasSimulationStarted && {display: 'none'} || {}}
            >
              Update Simulation
            </button>
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
          </div>
        </ul>
        <ul id ="simulation-slide-out" className="side-nav">
          <div id="run" className="col s12">
            <div className="row">
              <h5>Simulation Settings</h5>
            </div>
            <div className="row">
                <input
                  type     = "checkbox"
                  id       = "smooth-motion"
                  onChange = {::this.props.handlers.handleToggleSmoothMotion}
                />
                <label htmlFor="smooth-motion"> Toggle predictive motion smoothening</label>
            </div>
            {
              simID !== '0' ?
                <button
                  className = "btn waves-effect waves-light"
                  style     = {!simID && {display: 'none'} || {}}
                  onClick   = {(e) => this.props.handlers.handleSimulationActivate(simID)}
                >
                  Activate simulation
                </button>
                :
                ''
            }

            <div className="row">
              <p><strong>Simulation Speed:</strong></p>
              <SpeedSetting
                currentSpeed = {currentSpeed}
                hidden       = {!hasSimulationStarted}
                handlers     = {speedSettingHandlers}
              />
            </div>
            <button
              className = "btn  waves-effect waves-light"
              disabled  = {!allowSimulationStart}
              onClick   = {(e) => this._handleSimulationButton(e, hasSimulationStarted)}
            >
              { !allowSimulationStart &&
              <span>Simulation Ended</span> || hasSimulationStarted  &&
              <span>Disconnect Frameworks</span> || <span>Start simulation</span>
              }
            </button>
            <button
              className = "btn waves-effect waves-light"
              style     = {!hasSimulationStarted && allowSimulationStart && {display: 'none'} || {}}
              onClick   = {::this._handleBenchmarkRequest}
            >
              Request Benchmark
            </button>
            <a
              className = "btn waves-effect waves-light"
              href      = "#benchmarks"
              style     = {!benchmarkValues && {display: 'none'} || {}}
            >
              More Metrics
            </a>
            <ul className="collection">
              {
                this.props.frameworks.map((framework, index) => {
                  const benchmarkValue = benchmarkValues && benchmarkValues[framework._id];
                  return (
                    <li
                      className="collection-item"
                      key={index}
                    >
                      {index + ". " + (framework.name || "Framework")}
                      <button
                        className = "btn waves-effect waves-light"
                        style     = {this.props.frameworks.length == 1 && {display: 'none'} || {}}
                        onClick   = {(e) => this.props.handlers.handleRequestFrameworkDisconnect(framework.connectionIndex)}
                      >
                        Disconnect
                      </button>
                      { benchmarkValues &&
                        (benchmarkValue ?
                          <div> {benchmarkValue.completionSpeed} km/h is the journey completion speed </div> :
                          "No metric available as of yet")
                      }
                    </li>
                  );
                })
              }
            </ul>
          </div>
        </ul>
        <div id="benchmarks" className="modal bottom-sheet black-text">
          <div className="modal-content">
            <h4>Benchmarks</h4>
            { benchmarkValues &&
            <div>
              <table>
                <thead>
                  <tr>
                    <th data-field="id">Framework Name</th>
                    <th data-field="id">Journey Coompletion Speed (km/h)</th>
                    <th data-field="name">Jounrney Completion Speed Variance</th>
                    <th data-field="price">Slowest Journey Completion Speed (km/h)</th>
                    <th data-field="price">Total Travel Time (hrs)</th>
                    <th data-field="price">Average Travel Time (min)</th>
                    <th data-field="price">Total Travel Distance (km)</th>
                    <th data-field="price">Average Speed (km/h)</th>
                  </tr>
                </thead>

                <tbody>
                  {
                    Object.keys(benchmarkValues).map(function(key) {
                      const benchmarkValue = benchmarkValues[key];
                      return (
                        <tr key={key}>
                          <td>{names[key]}</td>
                          <td>{benchmarkValue.completionSpeed}</td>
                          <td>{benchmarkValue.completionSpeedVariance}</td>
                          <td>{benchmarkValue.slowestJourney}</td>
                          <td>{benchmarkValue.totalTime}</td>
                          <td>{benchmarkValue.averageTime}</td>
                          <td>{benchmarkValue.totalDistance}</td>
                          <td>{benchmarkValue.averageSpeed}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
            }
          </div>
          <div className="modal-footer">
            <a href="#!" className=" modal-action modal-close waves-effect waves-green btn-flat">close</a>
          </div>
        </div>
      </div>
    )
  }
}
