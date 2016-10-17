import React from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

export default class SimulationMap extends React.Component {
  static propTypes = {
    width: React.PropTypes.string,
    height: React.PropTypes.string,
    city: React.PropTypes.shape({
      position: React.PropTypes.arrayOf(Number),
      zoom: React.PropTypes.number
    }).isRequired,
    markers: React.PropTypes.arrayOf(React.PropTypes.arrayOf(Number))
  }

  render() {
    const style = {
      height: this.props.height || 300 + 'px',
      width: this.props.width || 300 + 'px'
    }

    const city = this.props.city;
    const markers = this.props.markers;

    return (
      <Map center={city.position} zoom={city.zoom} style={style} >
      <TileLayer
      url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {
        markers &&
        markers.map((marker, index) => {
          return (
            <Marker position={ marker } 
              key={ index }
            />
          )
        })
      }

      </Map>
    );
  }

}
