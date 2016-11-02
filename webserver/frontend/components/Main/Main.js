import React from 'react';
import SimulationMap from './SimulationMap/SimulationMap.js';
import SimulationSettings from './SimulationSettings/SimulationSettings.js';
import CustomPropTypes from '../Utils/CustomPropTypes.js';
import UtilFunctions from '../Utils/UtilFunctions.js';
import Header from './Header/Header.js';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    const host = window.location.hostname;

    const path = window.location.pathname;
    let simID = "0";
    if (/^\/simulation\/([a-z]|[0-9])+/.test(path)) {
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
        id: "0",
        cityID: "0"
      },
      simulationState: {
        id: "0",
        timestamp: "00:00:00",
        objects: [{
          id: "0",
          type: "car",
          speed: 50,
          direction: 45,
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
      this.setState({
        availableCities: messageData.content,
        selectedCityID: messageData.content[0]._id
      })
    } else if (messageData.type === "simulation-id") {
      this.setState({
        simulationInfo: messageData.content
      });
    } else if (messageData.type === "simulation-state") {
      this.setState({
        simulationState: messageData.content
      });
    }
  }

  handleAddJourney(journey) {
    const journeys = this.state.mapSelectedJourneys.concat([journey]);

    this.setState({
      mapSelectedJourneys: journeys
    })
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
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
