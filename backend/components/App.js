import React, { PropTypes } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

export default class App extends React.Component {
  render() {
    const position = [51.505, -0.09]

    const style = {
      height: 300 + 'px',
      width: 300 + 'px'
    }

    return (
      <Map center={position} zoom={13} style={style} >
      <TileLayer
      url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      </Map>
    );
  }
}

