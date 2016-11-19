import React from 'react';
import SimulationMap from './SimulationMap/SimulationMap.jsx';
import SimulationSettings from './SimulationSettings/SimulationSettings.jsx';
import CustomPropTypes from '../Utils/CustomPropTypes.jsx';
import UtilFunctions from '../Utils/UtilFunctions.jsx';
import Header from './Header/Header.jsx';
import cookie from 'react-cookie';
import 'whatwg-fetch';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    const host = window.location.hostname;

    const path = window.location.pathname;
    let simID = "0";
    if (/^\/simulations\/([a-z]|[0-9])+/.test(path)) {
      const tokens = path.split("/");
      simID = tokens[tokens.length - 1];
    }

    var socket = new WebSocket(`ws://${host}:3000`);

    socket.onopen = (event) => {
      console.log("Connected to: " + event.currentTarget.URL)

      socket.send(JSON.stringify({
        ...UtilFunctions.socketMessage(),
        type:"request-available-cities"
      }))
      socket.send(JSON.stringify({
        ...UtilFunctions.socketMessage(),
        type:"request-default-object-types"
      }))
      socket.send(JSON.stringify({
        ...UtilFunctions.socketMessage(),
        type:"request-object-kind-info"
      }))
      if (simID != "0") {
        this.handleJoinSimulation(simID);
      }
    }
    socket.onerror = (error) => { console.error("WebSocket error: " + error) }
    socket.onclose = (event) => { console.log("Disconnected from WebSocket") }
    socket.onmessage = (message) => { this.handleMessageReceive(message) }
    const initialToken = cookie.load('token') || '';
    this.state = {
      token: initialToken,
      userID: '',
      activeUser: '',
      selectedCityID: 0,
      selectedJourneyID: "0",
      socket: socket,
      simulationInfo: {
        id: simID,
        cityID: "0"
      },
      simulationState: {
        id: "0",
        timestamp: 0,
        latestTimestamp: 0,
        formattedTimestamp: "00:00:00",
        objects: []
      },
      pendingJourneys: []
    }
    this.updateUserSimulations();
  }

  updateUserSimulations() {
    if (this.state.token) {
      const url = '/simulations';
      const reqHeaders = new Headers({
        "Accept": "application/json",
        "token": this.state.token,
        "Set-Cookie": "token=" + this.state.token,
      });
      fetch(url, {
        method: 'GET',
        headers: reqHeaders
      })
      .then((response) => {
        response.json().then((data) => {
          this.setState({
            activeUser: data.username,
            userSimulations: data.simulations
          });
        });
      })
      .catch(err => {
        console.log("error fetching user simulations");
      })
    }
  }

  handlePendingJourneyAdd(pendingJourney) {
    const pendingJourneys = this.state.pendingJourneys || [];
    this.setState({
      pendingJourneys: pendingJourneys.concat([pendingJourney])
    })
  }

  handleMessageReceive(message) {
    const messageData = JSON.parse(message.data);

    if (messageData.type === "available-cities") {
      if (this.state.simulationInfo.id == 0) {
        //this._startInitialSimulation(messageData.content[0]._id);
      }
      this.setState({
        availableCities: messageData.content,
        selectedCityID: messageData.content[0]._id
      });
    } else if (messageData.type === "simulation-id") {
      this.setState({
        simulationInfo: messageData.content.simulationInfo,
        simulationJourneys: messageData.content.journeys
      });
    } else if (messageData.type === "simulation-journeys-update") {
      this.setState({
        simulationJourneys: messageData.content.journeys
      });
    } else if (messageData.type === "simulation-state") {
      const simulationState = messageData.content.state;
      if (messageData.content.latestTimestamp) {
        simulationState['latestTimestamp'] = messageData.content.latestTimestamp;
      } else {
        simulationState['latestTimestamp'] = this.state.simulationState['latestTimestamp'];
      }
      this.setState({
        simulationState: simulationState
      });
    } else if (messageData.type === "simulation-start-parameters") {
      const newSimulationInfo = this.state.simulationInfo;
      newSimulationInfo.id = messageData.content.simID;
      const journeys = messageData.content.journeys;
      const selectedCityID = messageData.content.cityID;
      this.setState({
        simulationInfo: newSimulationInfo,
        simulationJourneys: journeys,
        selectedCityID: selectedCityID
      });
    } else if (messageData.type === "simulation-confirm-close") {
      const newSimulationInfo = this.state.simulationInfo;
      newSimulationInfo.id = "0";
      this.setState({
        simulationInfo: newSimulationInfo
      });
    } else if (messageData.type === "default-object-types") {
      this.setState({
        objectTypes: messageData.content
      })
    } else if (messageData.type === "object-kind-info") {
      this.setState({
        objectKindInfo: messageData.content
      })
    } else if (messageData.type === "simulation-benchmark") {
      const benchmarkValue = messageData.content.value;
      this.setState({
        benchmarkValue: benchmarkValue
      })
    }
  }

  handleJoinSimulation(simulationID) {
    const socket = this.state.socket;

    const type = "request-simulation-join";
    const content = {
      simulationID: simulationID
    }

    var message = JSON.stringify({
      ...UtilFunctions.socketMessage(),
      type: type,
      content: content
    })

    socket.send(message);
  }

  _cityWithID(id) {
    const availableCities = this.state.availableCities;
    if (availableCities) {
      for (const city of availableCities) {
        if (city._id === id) {
          return city;
        }
      }
    }
  }

  handleCityChange(newCityId) {
    this.setState({
      selectedCityID: newCityId
    })
  }


  handleTokenChange(newToken, userID, username) {
    this.setState({
      token: newToken,
      userID: userID,
      activeUser: username
    });
  }

  handlePositionPreview(position) {
    this.setState({
      previewMarkerPosition: position
    })
  }

  _startInitialSimulation(cityId) {
    const journeys = this.state.pendingJourneys || [];
    const userID = this.state.userID;
    const type = "request-simulation-start";
    const initialSettings = {
      selectedCity: cityId,
      journeys: journeys,
      userID: userID
    }
    const socket = this.state.socket;
    UtilFunctions.sendSocketMessage(socket, type, initialSettings);
  }

  handleObjectTypeCreate(typeInfo) {
    const objectTypes = this.state.objectTypes || [];
    this.setState({
      objectTypes: objectTypes.concat([typeInfo])
    })
  }

  handleSpeedChange(newSpeed) {
    const socket = this.state.socket;
    const type = 'request-simulation-speed-change';
    const content = {
      simulationSpeed: newSpeed
    };

    UtilFunctions.sendSocketMessage(socket, type, content);

    this.setState({
      currentSpeed: newSpeed
    });
  }

  handlePause() {
    if (this.state.currentSpeed != undefined) {
      this.setState({
        pausedSpeed: this.state.currentSpeed
      });
    }

    this.handleSpeedChange(0);
  }

  handleResume() {
    if (this.state.pausedSpeed == undefined) {
      this.handleSpeedChange(1);
    } else {
      this.handleSpeedChange(this.state.pausedSpeed);

      this.setState({
        pausedSpeed: null
      });
    }
  }

  handleScrub(newTimestamp) {
    const socket = this.state.socket;
    const type = 'request-simulation-timestamp-change';
    const content = {
      simulationID: this.state.simulationInfo.id,
      timestamp: newTimestamp
    };

    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  handleSimulationClose() {
    const socket = this.state.socket;
    const simID = this.state.simulationInfo.id;
    const type = "request-simulation-close";
    const content = {
      simulationID: simID
    }
    UtilFunctions.sendSocketMessage(socket, type, content);
  }


  handleHotspotGeneration() {
    const socket = this.state.socket;
    const city = this._cityWithID(this.state.selectedCityID);
    const type = "request-hotspot-generation";
    UtilFunctions.sendSocketMessage(socket, type, city)
  }
  handleSimulationStart() {
    const pendingJourneys = this.state.pendingJourneys || [];
    const socket = this.state.socket;
    const selectedCity = this._cityWithID(this.state.selectedCityID);
    const userID = this.state.userID;

    const type = "request-simulation-start";
    const content = {
      selectedCity: selectedCity,
      journeys: pendingJourneys,
      userID: userID
    }

    UtilFunctions.sendSocketMessage(socket, type, content);
    this.clearPendingJourneys();
  }

  handleSimulationUpdate() {
    const pendingJourneys = this.state.pendingJourneys || [];
    const socket = this.state.socket;
    const selectedCity = this._cityWithID(this.state.selectedCityID);

    const simID = this.state.simulationInfo.id;
    const hasSimulationStarted = simID !== "0";

    if (!hasSimulationStarted) {
      console.error("Tried to update a simulation that hasn't started");
      return
    }

    const type = "request-simulation-update";
    const content = {
      simulationID: simID,
      journeys: pendingJourneys
    }

    UtilFunctions.sendSocketMessage(socket, type, content);
    this.clearPendingJourneys();
  }

  handleBenchmarkRequest() {
    const socket = this.state.socket;

    const simID = this.state.simulationInfo.id;
    const hasSimulationStarted = simID !== "0";

    if (!hasSimulationStarted) {
      console.error("Tried to benchmark a simulation that hasn't started");
      return
    }

    const type = "request-simulation-benchmark";
    const content = {
      simulationID: simID,
    }

    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  handleJourneyListItemMouseOver(journey, e) {
    this.setState({
      selectedJourneyID: journey['_id']
    })
  }

  handleJourneyListItemMouseOut(journey, e) {
    this.setState({
      selectedJourneyID: "0"
    })
  }

  clearPendingJourneys() {
    this.setState({
      pendingJourneys: []
    })
  }

  componentDidUpdate() {
    const sessionToken = cookie.load('token');
    if (sessionToken && this.state.token) {
      cookie.save('token', sessionToken, {
        path: '/',
        maxAge: UtilFunctions.session_length,
      });
    }
  }

  render() {
    const simulationInfo = this.state.simulationInfo;
    const simulationState = this.state.simulationState;
    const availableCities = this.state.availableCities;
    const simulationID = this.state.simulationInfo.id;
    const token = this.state.token;
    const userID = this.state.userID;
    const activeUser = this.state.activeUser;
    const userSimulations = this.state.userSimulations;

    const pendingJourneys = this.state.pendingJourneys || [];
    const simulationJourneys = this.state.simulationJourneys || [];

    const previewMarkerPosition = this.state.previewMarkerPosition;

    const selectedCity = this._cityWithID(this.state.selectedCityID);
    const bounds = selectedCity ? selectedCity.bounds : null;

    const headerHandlers = {
      handleJoinSimulation : ::this.handleJoinSimulation,
      handleCityChange     : ::this.handleCityChange,
      handleTokenChange    : ::this.handleTokenChange
    }

    const simulationSettingsHandlers = {
      handleBenchmarkRequest          : ::this.handleBenchmarkRequest,
      handleHotspotGeneration         : ::this.handleHotspotGeneration,
      handleSimulationStart           : ::this.handleSimulationStart,
      handleSimulationUpdate          : ::this.handleSimulationUpdate,
      handleSimulationClose           : ::this.handleSimulationClose,
      handlePositionSelect            : ::this.handlePositionPreview,
      handleObjectTypeCreate          : ::this.handleObjectTypeCreate,
      handleSpeedChange               : ::this.handleSpeedChange,
      handlePendingJourneyAdd         : ::this.handlePendingJourneyAdd,
      handleJourneyListItemMouseOver  : ::this.handleJourneyListItemMouseOver,
      handleJourneyListItemMouseOut   : ::this.handleJourneyListItemMouseOut

    }

    const simulationMapHandlers = {
      handleAddJourney : ::this.handlePendingJourneyAdd,
      handlePause      : ::this.handlePause,
      handleResume     : ::this.handleResume,
      handleScrub      : ::this.handleScrub
    }

    return (
      <div>
        <Header
          availableCities = {availableCities}
          token           = {token}
          userID          = {userID}
          activeUser      = {activeUser}
          simulations     = {userSimulations}
          handlers        = {headerHandlers}
        />
        <div className="jumbotron">
          <div className="container">
            <div className="col-md-4 text-center" id="simulation-settings">
              <SimulationSettings
                activeSimulationID  = {simulationID}
                selectedCity        = {selectedCity}
                pendingJourneys     = {pendingJourneys}
                simulationJourneys  = {simulationJourneys}
                objectTypes         = {this.state.objectTypes}
                objectKindInfo      = {this.state.objectKindInfo}
                benchmarkValue      = {this.state.benchmarkValue}
                handlers            = {simulationSettingsHandlers}
              />
            </div>
            <div className="col-md-6 map" id="simulation-map">
              <SimulationMap
                width                      = {680 + 'px'}
                height                     = {600 + 'px'}
                simulationID               = {simulationID}
                bounds                     = {bounds}
                simulationState            = {simulationState}
                previewMarkerPosition      = {previewMarkerPosition}
                objectTypes                = {this.state.objectTypes}
                selectedJourneyID          = {this.state.selectedJourneyID}
                handlers                   = {simulationMapHandlers}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
