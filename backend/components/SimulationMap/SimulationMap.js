import React from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

export default class SimulationMap extends React.Component {
  static propTypes = {
    width: React.PropTypes.string,
    height: React.PropTypes.string,
    position: React.PropTypes.arrayOf(Number),
    zoom: React.PropTypes.number,
    markers: React.PropTypes.arrayOf(React.PropTypes.arrayOf(Number))
  }

  render() {
    const style = {
      height: this.props.height || 300 + 'px',
      width: this.props.width || 300 + 'px'
    }

    const markers = this.props.markers;

    return (
      <Map center={this.props.position} zoom={13} style={style} >
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
