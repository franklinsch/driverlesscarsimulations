import React, { PropTypes } from 'react';
import { Map, Marker, TileLayer, Popup } from 'react-leaflet';
import L, { Icon, marker } from 'leaflet'
import CustomPropTypes from '../../Utils/CustomPropTypes.js'
import 'leaflet-rotatedmarker'

export default class RotatableMarker extends React.Component {
  static propTypes = {
    icon: PropTypes.instanceOf(Icon),
    opacity: PropTypes.number,
    position: CustomPropTypes.position.isRequired,
    zIndexOffset: PropTypes.number,
    rotationAngle: PropTypes.number,
    handleClick: PropTypes.func
  }

  componentDidMount() {
    if (this.leafletElement) {
      if (this.props.handleClick) {
        this.leafletElement.on('click', this.props.handleClick);
      }
    } else {
      console.log('No leaflet element found');
    }
  }

  componentDidUpdate(prevProps) {
    if (this.leafletElement) {
      if (this.props.handleClick != prevProps.handleClick) {
        this.leafletElement.off('click', prevProps.handleClick);
        this.leafletElement.on('click', this.props.handleClick);
      }

      if (this.props.rotationAngle !== prevProps.rotationAngle) {
        this.leafletElement.setRotationAngle(this.props.rotationAngle);
      }
    }
  }

  render() {
    const key = this.props.key+'Marker';

    return (
      <Marker position={this.props.position} 
              key={key}
              icon={this.props.icon}
              rotationAngle={this.props.rotationAngle}
              ref={(marker) => { if (marker) this.leafletElement = marker.leafletElement }}
      >
        {this.props.children}
      </Marker>
    )
  }
}
