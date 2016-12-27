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

    var socket = new WebSocket('ws://' + host + ':3000');

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
        timestamp: 0,
        latestTimestamp: 0,
        objects: []
      },
      pendingJourneys: []
    }
    this.updateUserSimulations();

    this.smoothMotion = false;
    this.averageWaitingTime = undefined;
    this.lastUpdateTime = undefined;
  }

  updateUserSimulations() {
    if (this.state.token) {
      const url = '/simulations';
      const reqHeaders = new Headers({
        "Accept": "application/json",
        "token": this.state.token,
      });
      fetch(url, {
        method: 'GET',
        headers: reqHeaders
      })
        .then((response) => {
          response.json().then((data) => {
            this.setState({
              userID: data.userID,
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
      if (this.lastWaitingTime) {
        const weight = 0.6;
        const newWaitingTime = Date.now() - this.lastWaitingTime;
        if (this.averageWaitingTime) {
          this.averageWaitingTime = (1-weight) * this.averageWaitingTime + weight * newWaitingTime;
        } else {
          this.averageWaitingTime = newWaitingTime;
        }
      }
      this.lastWaitingTime = Date.now();

      const simulationState = messageData.content.state;
      simulationState['latestTimestamp'] = messageData.content.latestTimestamp;

      const timestampDiff = simulationState.timestamp - this.state.simulationState.timestamp;
      if (this.state.currentSpeed > 1 &&
          this.state.currentSpeed != timestampDiff) {
        this.handleSpeedChange(timestampDiff);
      }
      if (simulationState.timestamp == this.state.simulationState.timestamp) {
        simulationState['objects'] = this.state.simulationState['objects'];
      } else {
        const frameworkStates = simulationState.frameworkStates;
        let objects = [];

        let colourIndex = 0
        for (const fState of simulationState.frameworkStates) {
          fState.objects.map((object) => {
            object.colourIndex = colourIndex
          });
          objects.push(fState.objects);
          colourIndex++;
        }
        objects = objects.reduce((acc, fObjects) => {return acc.concat(fObjects)})
        //const objects = frameworkStates.map((fState) => {
          //const objects = fState.objects;
          //objects.map((object) => {
            //object.frameworkID = fState.frameworkID;
            //return object;
          //})

          //return objects;
        //}).reduce((acc, fObjects) => {return acc.concat(fObjects)})
        simulationState.objects = objects;
      }

      if (this.smoothMotion) {
        this.setState({
          simulationState: simulationState
        }, () => this._smoothMotion(this.state.simulationState.timestamp, this.lastWaitingTime));
      } else {
        this.setState({
          simulationState: simulationState
        });
      }
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
      const path = window.location.pathname;

      if (!/^\/simulations\/([a-z]|[0-9])+/.test(path)) {
        newSimulationInfo.id = "0";
        this.setState({
          simulationInfo: newSimulationInfo
        });
      }
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
      });
    } else if (messageData.type === "user-api-access") {
      const id = messageData.content.api_id;
      const key = messageData.content.api_key;
      alert("Your API id is " + id + " and your API key is " + key);
    } else if (messageData.type === "user-error") {
      alert(messageData.content.error);
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

    if (this.state.simulationInfo.id == "0") {
      this.setState({
        pendingJourneys: []
      })
    }
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
    this.updateUserSimulations();
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
    this.setState({
      pausedSpeed: this.state.currentSpeed || 1
    });

    this.handleSpeedChange(0);
  }

  handleResume() {
    this.handleSpeedChange(this.state.pausedSpeed || 1);
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

  handleSimulationStart(useRealData, realWorldJourneyNum, hotspotFile) {
    const pendingJourneys = this.state.pendingJourneys || [];
    const socket = this.state.socket;
    const selectedCity = this._cityWithID(this.state.selectedCityID);
    const userID = this.state.userID;
    const type = "request-simulation-start";
    const content = {
      selectedCity: selectedCity,
      journeys: pendingJourneys,
      userID: userID,
      useRealData: useRealData,
      realWorldJourneyNum: realWorldJourneyNum,
    };

    if (hotspotFile) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/uploads', true);
      xhr.onload = () => {
        if (xhr.status === 200) {
          UtilFunctions.sendSocketMessage(socket, type, content);
          this.updateUserSimulations();
          this.clearPendingJourneys();
        } else {
          console.error("An error occured during POST request");
        }
      };
      xhr.send(hotspotFile);
    }
    else {
      UtilFunctions.sendSocketMessage(socket, type, content);
      this.updateUserSimulations();
      this.clearPendingJourneys();
    }
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

  handleSimulationActivate(simulationID) {
    const url = '/simulations/activate';
    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "token": this.state.token,
      },
      body: JSON.stringify({
        simulationID: simulationID
      })
    })
      .then((response) => {
        if (!response.ok) {
          console.log("error authenticating user");
          return;
        }
      })
      .catch(err => {
        console.log("error updating active simulations");
      })
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

  handleRequestAPIAccess() {
    const socket = this.state.socket;
    const user = this.state.userID;

    const type = "request-user-api-access";
    const content = {
      userID: user
    }

    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  clearPendingJourneys() {
    this.setState({
      pendingJourneys: []
    })
  }

  //_addDistance(point, direction, distance) {
    //const LNG_SCL = 111.319e3;
    //const LAT_SCL = 110.574e3;
    //direction *= Math.PI / 180;
    //latDeg = distance * Math.sin(direction)/(LAT_SCL*Math.cos(point[1]*Math.PI/180))
    //lngDeg = distance * Math.cos(direction)/LNG_SCL
    //return [point[0] + lngDeg, point[1] + latDeg]

  _addDistance(point, bearing, distance) {
    const R = 6371e3;

    const delta = distance/R;
    const theta = bearing * Math.PI / 180;
    const lat1 = point['lat'] * Math.PI / 180;
    const lng1 = point['lng'] * Math.PI / 180;

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(delta) + Math.cos(lat1) * Math.sin(delta) * Math.cos(theta));
    const lng2 = lng1 + Math.atan2(Math.sin(theta) * Math.sin(delta) * Math.cos(lat1), Math.cos(delta) - Math.sin(lat1) * Math.sin(lat2));

    return {
      lat: lat2 * 180 / Math.PI,
      lng: lng2 * 180 / Math.PI
    };
  }

  _handleToggleSmoothMotion() {
    this.smoothMotion = !this.smoothMotion;
  }

  _smoothMotion(timestamp, lastWaitingTime) {
    if (this.averageWaitingTime && lastWaitingTime && this.smoothMotion) {
      const elapsedTime = Date.now() - lastWaitingTime;
      if (timestamp == this.state.simulationState.timestamp && elapsedTime <= this.averageWaitingTime) {
        const RATIO = 0.1;
        const TIMEOUT = RATIO * this.averageWaitingTime;

        const simulationState = this.state.simulationState;
        for (const object of simulationState.objects) {
          const simulationSpeed = this.state.currentSpeed != undefined ?
            this.state.currentSpeed :
            1;
          const distance = RATIO * object.speed * 1000 / (60 * 60) * simulationSpeed;
          object.position = this._addDistance(object.position, object.bearing, distance);
        }
        this.setState({
          simulationState: simulationState
        });
        setTimeout(::this._smoothMotion, TIMEOUT, timestamp, lastWaitingTime);
      }
    }
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

    const simulationRunning = simulationID != undefined && simulationID != 0;

    const headerHandlers = {


      handleJoinSimulation            : ::this.handleJoinSimulation,
      handleCityChange                : ::this.handleCityChange,
      handleTokenChange               : ::this.handleTokenChange,
      handleJourneyListItemMouseOver  : ::this.handleJourneyListItemMouseOver,
      handleJourneyListItemMouseOut   : ::this.handleJourneyListItemMouseOut,
      handleBenchmarkRequest          : ::this.handleBenchmarkRequest,
      handleSimulationStart           : ::this.handleSimulationStart,
      handleSimulationUpdate          : ::this.handleSimulationUpdate,
      handleSimulationClose           : ::this.handleSimulationClose,
      handlePositionSelect            : ::this.handlePositionPreview,
      handleObjectTypeCreate          : ::this.handleObjectTypeCreate,
      handleSpeedChange               : ::this.handleSpeedChange,
      handlePendingJourneyAdd         : ::this.handlePendingJourneyAdd,
      handleSimulationActivate        : ::this.handleSimulationActivate,
      handlePause                     : ::this.handlePause,
      handleResume                     : ::this.handleResume,
      handleScrub                     : ::this.handleScrub
    }
    
    const simulationSettingsHandlers = {

    }

    const simulationMapHandlers = {
      handleAddJourney         : ::this.handlePendingJourneyAdd,
    }

    return (
      <div>
        <Header
          enabled         = {!simulationRunning}
          availableCities = {availableCities}
          token           = {token}
          userID          = {userID}
          activeUser      = {activeUser}
          simulations     = {userSimulations}
          pendingJourneys     = {pendingJourneys}
          simulationJourneys  = {simulationJourneys}
          activeSimulationID  = {simulationID}
          simulationState     = {simulationState}
          selectedCity        = {selectedCity}
          objectTypes         = {this.state.objectTypes}
          objectKindInfo      = {this.state.objectKindInfo}
          benchmarkValue      = {this.state.benchmarkValue}
          handlers        = {headerHandlers}
        />
        <div className="row">
          <div className="col s3" id="simulation-settings">
          </div>
          <div className="col s9 " id="simulation-map">
            <SimulationMap
              simulationID               = {simulationID}
              bounds                       = {bounds}
              simulationState            = {simulationState}
              previewMarkerPosition      = {previewMarkerPosition}
              objectTypes                = {this.state.objectTypes}
              selectedJourneyID          = {this.state.selectedJourneyID}
              handlers                   = {simulationMapHandlers}
            />
          </div>
        </div>
      </div>
    )
  }
}
