import React from 'react';
import SimulationMap from './SimulationMap/SimulationMap.js';
import Dropdown from './Dropdown/Dropdown.jsx';
import CustomPropTypes from '../Utils/CustomPropTypes.js';

export default class Main extends React.Component {

  static propTypes = {
    availableCities: React.PropTypes.arrayOf(CustomPropTypes.city)
  }

  constructor(props) {
    super(props);

    var socket = new WebSocket("ws://localhost:9000");

    socket.onopen = (event) => { console.log("Connected to: " + event.currentTarget.URL) }
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
      },
      availableCities: [
        { label: 'London', value: { position: {
          lat: 51.505, 
          lng: -0.09
        }, zoom: 13 }},
        { label: 'Munich', value: { position: {
          lat: 48.1351, 
          lng: 11.5820
        }, zoom: 13 }}
      ]
    }
  }

  handleMessageReceive(message) {
    print("Received " + message);
  }

  socketMessage() {
    return {
      date: Date.now()
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

  _onCitySelect(value) {
    const simulationInfo = this.state.simulationInfo;

    const currentCity = value

    const newSimulationInfo = {
      ...simulationInfo,
      city: currentCity
    }

    this.setState({
      simulationInfo: newSimulationInfo
    })

    const socket = this.state.socket;

    socket.send({
      ...this.socketMessage(),
      type: "simulationInfo",
      content: simulationInfo
    });
  }

  render() {
    const cities = this.state.availableCities;
    const simulationInfo = this.state.simulationInfo;
    const simulationState = this.state.simulationState;

    return (
      <div>
      <Dropdown items={cities} onSelect={(value) => { this._onCitySelect(value) }} />

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

