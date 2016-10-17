import React from 'react';
import SimulationMap from './SimulationMap/SimulationMap.js';
import Dropdown from '../Dropdown/Dropdown.jsx';

export default class Simulation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      coordinateString: "",
      cars: [
        {
          id: "0",
          position: {
            lat: 51.505,
            lng: -0.09
          }
        }
      ],
      currentCity: {
        position: { 
          lat: 51.505, 
          lng: -0.09
        }, 
        zoom: 13 
      }
    }
  }

  onChange(event) {
    this.setState({
      coordinateString: event.target.value
    })
  }

  onMove() {
    const cars = this.state.cars;

    cars.forEach( (car, i) => {
      if (car.id === "0") {
        car.position.lat += 0.001
        cars[i] = car
      }
    })

    this.setState({
      cars: cars
    })
  } 

  _onCitySelect(value) {
    this.setState({
      currentCity: value
    });
  }

  render() {
    let cities = [
      { label: 'London', value: { position: {
        lat: 51.505, 
        lng: -0.09
      }, zoom: 13 }},
      { label: 'Munich', value: { position: {
        lat: 48.1351, 
        lng: 11.5820
      }, zoom: 13 }}
    ];

    const cars = this.state.cars;
    const currentCity = this.state.currentCity;
    
    return (
      <div>
      <Dropdown items={cities} onSelect={(value) => { this._onCitySelect(value) }} />

      <button onClick={ () => this.onMove() }>Move car</button>

      <SimulationMap 
      width={ 300 + 'px' }
      height={ 300 + 'px' }
      city={ currentCity }
      cars= { cars }
      />
      </div>
    )
  }
}

