import React from 'react';
import SimulationMap from './SimulationMap/SimulationMap.js';
import SimulationSettings from './SimulationSettings/SimulationSettings.js';
import CustomPropTypes from '../Utils/CustomPropTypes.js';
import UtilFunctions from '../Utils/UtilFunctions.js';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    var socket = new WebSocket("ws://146.169.46.192:3000");

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
        city: {
          position: {
            lat: 51.505,
            lng: -0.09
          },
          zoom: 13
        }
      },
      simulationState: {
        id: "0",
        timestamp: "00:00:00",
        objects: [ {
          id: "0",
          type: "car",
          position: { 
            lat: 51.505, 
            lng: -0.09
          } 
        }]
      }
    }
  }

  handleMessageReceive(message) {
    const messageData = JSON.parse(message.data);

    if (messageData.type === "available-cities") {
      this.setState({
        availableCities: messageData.content
      })
    }
  }

  _onMove() {
    const simulationState = this.state.simulationState;
    const cars = simulationState.objects;

    cars.forEach( (car, i) => {
      if (car.id === "0") {
        car.position.lat += 0.001
        cars[i] = car
      }
    })

    const newSimulationState = {
      ...simulationState,
      objects: cars
    }

    this.setState({
      simulationState: newSimulationState
    })
  } 

  render() {
    const cities = this.state.availableCities;
    const simulationInfo = this.state.simulationInfo;
    const simulationState = this.state.simulationState;
    const availableCities = this.state.availableCities;
    const socket = this.state.socket;

    return (
      <div>
        <SimulationSettings
          socket={socket}
          availableCities={availableCities}
        />

        <button onClick={ () => this._onMove() }>Move car</button>

        <SimulationMap 
          width={ 300 + 'px' }
          height={ 300 + 'px' }
          simulationInfo={ simulationInfo }
          simulationState= { simulationState }
        />
      </div>
    )
  }
}

