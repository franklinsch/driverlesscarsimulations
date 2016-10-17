import React from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import CustomPropTypes from '../Utils/CustomPropTypes.js'

export default class SimulationMap extends React.Component {
  static propTypes = {
    width: React.PropTypes.string,
    height: React.PropTypes.string,
    city: CustomPropTypes.city.isRequired,
    cars: React.PropTypes.arrayOf(CustomPropTypes.car)
  }

  render() {
    const style = {
      height: this.props.height || 300 + 'px',
      width: this.props.width || 300 + 'px'
    }

    const city = this.props.city;
    const cars = this.props.cars;

    return (
      <Map center={[city.position.lat, city.position.lng]} zoom={city.zoom} style={style} >
      <TileLayer
      url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {
        cars &&
        cars.map((car, index) => {
          const key = car.position.lat.toString() + car.position.lng.toString()
          return (
            <Marker position={ car.position } 
              key={ key }
            />
          )
        })
      }

      </Map>
    );
  }

}
