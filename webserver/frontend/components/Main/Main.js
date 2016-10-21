import React from 'react';
import SimulationMap from './SimulationMap/SimulationMap.js';
import SimulationSettings from './SimulationSettings/SimulationSettings.js';
import CustomPropTypes from '../Utils/CustomPropTypes.js';
import UtilFunctions from '../Utils/UtilFunctions.js';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    var socket = new WebSocket("ws://localhost:3000");

    socket.onopen = (event) => { 
      console.log("Connected to: " + event.currentTarget.URL) 

      socket.send(JSON.stringify({
        ...UtilFunctions.socketMessage(),
        type:"request-available-cities"
      }))
    }
    socket.onerror = (error) => { console.error("WebSocket error: " + error) }
    socket.onclose = (event) => { console.log("Disconnected from WebSocket") }
    socket.onmessage = (message) => { this.handleMessageReceive(message) }

    this.state = {
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
          position: { 
            lat: 50.68264,
            lng: 4.78661
          } 
        }]
      }
    }
  }

  handleMessageReceive(message) {
    this.setState({simulationState: {id: "20"}});
    const messageData = JSON.parse(message.data);

    if (messageData.type === "available-cities") {
      this.setState({
        availableCities: messageData.content
      })
    } else if (messageData.type === "simulation-id") {
      this.setState({
        simulationInfo: {
          id: messageData.content.simulationID,
          cityID: this.state.simulationInfo.cityID
        }
      });
    } else if (messageData.type === "simulation-state") {
      console.log(messageData.content);
      this.setState({
        simulationState: messageData.content
      });
    }
  }

  _boundsForCity(cityID) {
    const availableCities = this.state.availableCities;

    if (availableCities) {
      for (const city of availableCities) {
        if (city.value.id === cityID) {
          return city.value.bounds
        }
      }
    }
  }

  render() {
    const cities = this.state.availableCities;
    const simulationInfo = this.state.simulationInfo;
    const simulationState = this.state.simulationState;
    const availableCities = this.state.availableCities;
    const socket = this.state.socket;
    const simulationID = this.state.simulationInfo.id;
    console.log(simulationID);

    const bounds = this._boundsForCity(simulationInfo.cityID);

    return (
      <div>
        <SimulationSettings
          socket={socket}
          availableCities={availableCities}
          activeSimulationID={simulationID}
        />

        <SimulationMap 
          width={ 600 + 'px' }
          height={ 600 + 'px' }
          bounds={ bounds }
          simulationState= { simulationState }
        />
      </div>
    )
  }
}

