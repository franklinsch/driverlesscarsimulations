import React from 'react';
import SimulationMap from './SimulationMap/SimulationMap.js';
import Dropdown from './Dropdown/Dropdown.jsx';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      coordinateString: "",
      cars: [
        {
          id: "0",
          position: [51.505, -0.09]
        }
      ],
      currentCity: {
        position: [51.505, -0.09], 
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
        car.position[0] += 0.001
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
      { label: 'London', value: { position: [51.505, -0.09], zoom: 13 }},
      { label: 'Munich', value: { position: [48.1351, 11.5820], zoom: 13 }}
    ];

    const cars = this.state.cars;
    const currentCity = this.state.currentCity;

    console.log(cars)
    
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

