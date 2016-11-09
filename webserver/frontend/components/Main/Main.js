import React from 'react';
import SimulationMap from './SimulationMap/SimulationMap.js';
import SimulationSettings from './SimulationSettings/SimulationSettings.js';
import CustomPropTypes from '../Utils/CustomPropTypes.js';
import UtilFunctions from '../Utils/UtilFunctions.js';
import Header from './Header/Header.js';
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
    this.state = {
      selectedCityID: 0,
      socket: socket,
      simulationInfo: {
        id: simID,
        cityID: "0"
      },
      simulationState: {
        id: "0",
        timestamp: 0,
        formattedTimestamp: "00:00:00",
        objects: [{
          id: "0",
          objectType: "car",
          speed: 50,
          direction: 45,
          route: [
              [4.778602,50.6840807],[4.7806405,50.6834349],[4.7825824,50.6829387],[4.7874197,50.6825434],
              [4.7892558,50.6824288],[4.7905647,50.6822793],[4.7918953,50.6820401],[4.7920023,50.6820209],
              [4.7929465,50.681851],[4.7934554,50.6817269], [4.7939013,50.6815791],[4.7942264,102.6814472]
          ],
          position: {
            lat: 50.68264,
            lng: 4.78661
          }
        }]
      },
      mapSelectedJourneys: []
    }
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
      this.postInitialJourneys(messageData.content.id);
      this.setState({
        simulationInfo: messageData.content
      });
    } else if (messageData.type === "simulation-state") {
      this.setState({
        simulationState: messageData.content
      });
    } else if (messageData.type === "simulation-start-parameters") {
      const newSimulationInfo = this.state.simulationInfo;
      newSimulationInfo.id = messageData.content.simID;
      this.setState({
        simulationInfo: newSimulationInfo
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
    }
  }

  handleAddJourney(journey) {
    const simID = this.state.simulationInfo.id;
    if (simID != "0") {
      this.postJourney(journey, simID);
    }
    const journeys = this.state.mapSelectedJourneys.concat([journey]);
    this.setState({mapSelectedJourneys: journeys});
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

  postJourney(journey, simID) {
    const fetchUrl = "/simulations/" + simID + "/journeys";
    fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: journey
    })
      .then((response) => {
      })
      .catch((err) => {
        console.log("New journey was not saved due to: " + err);
      });

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

  _handleCityChange(newCityId) {
    this.setState({
      selectedCityID: newCityId
    })
  }

  _handlePositionPreview(position) {
    this.setState({
      previewMarkerPosition: position
    })
  }

  _startInitialSimulation(cityId) {
    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);
    const type = "request-simulation-start";
    const initialSettings = {
      selectedCity: cityId,
      journeys: allJourneys
    }
    const socket = this.state.socket;
    UtilFunctions.sendSocketMessage(socket, type, initialSettings);
  }

  postInitialJourneys(simID) {
    const journeys = this.state.journeys || [];
    const allJourneys = journeys.concat(this.props.mapSelectedJourneys);
    for (const journey of allJourneys) {
      this.postJourney(journey, simID);
    }
  }
    
  _handleObjectTypeCreate(typeInfo) {
    const objectTypes = this.state.objectTypes || [];
    this.setState({
      objectTypes: objectTypes.concat([typeInfo])
    })
  }

  render() {
    const cities = this.state.availableCities;
    const simulationInfo = this.state.simulationInfo;
    const simulationState = this.state.simulationState;
    const availableCities = this.state.availableCities;
    const socket = this.state.socket;
    const simulationID = this.state.simulationInfo.id;

    const mapSelectedJourneys = this.state.mapSelectedJourneys || [];

    const previewMarkerPosition = this.state.previewMarkerPosition;

    const selectedCity = this._cityWithID(this.state.selectedCityID);
    const bounds = selectedCity ? selectedCity.bounds : null;

    return (
      <div>
        <Header
          socket={socket}
          availableCities={availableCities}
          handleCityChange={(newCityId => {this._handleCityChange(newCityId)})}
          handleJoinSimulation={(simulationId => {this.handleJoinSimulation(simulationId)})}
        />
         <div className="jumbotron">
          <div className="container">
            <div className="col-md-4 text-center" id="simulation-settings">
              <SimulationSettings
                socket={socket}
                activeSimulationID={simulationID}
                selectedCity={selectedCity}
                mapSelectedJourneys={mapSelectedJourneys}
                handlePositionPreview={(position) => {this._handlePositionPreview(position)}}
                handleObjectTypeCreate={(typeInfo) => {this._handleObjectTypeCreate(typeInfo)}}
                objectTypes={this.state.objectTypes}
                objectKindInfo={this.state.objectKindInfo}
              />
            </div>
            <div className="col-md-6 map" id="simulation-map">
              <SimulationMap
                width={ 680 + 'px' }
                height={ 600 + 'px' }
                bounds={ bounds }
                simulationState= { simulationState }
                handleAddJourney= { (journey) => { this.handleAddJourney(journey) } }
                previewMarkerPosition={previewMarkerPosition}
                clearPreviewMarkerPosition={() => { this._handlePreviewMarkerPositionClear() }}
                objectTypes={this.state.objectTypes}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
