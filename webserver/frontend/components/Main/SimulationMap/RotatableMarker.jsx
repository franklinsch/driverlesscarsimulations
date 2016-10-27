import React from 'react';
import { Icon, Marker } from 'react-leaflet';
import CustomPropTypes from '../../Utils/CustomPropTypes.js'

export default class RotatableMarker extends React.Component {
  componentDidMount() {
    console.log('updated component', this.leafletElement);

    if (this.props.rotationAngle) {
      this.leafletElement.setRotationAngle(this.props.rotationAngle);
    }
  }

  componentDidUpdate(prevProps) {
    console.log('updated component', this.leafletElement);
    if (this.props.rotationAngle && this.props.rotationAngle !== prevProps.rotationAngle) {
      this.leafletElement.setRotationAngle(this.props.rotationAngle);
    }
  }

  render() {
    return (
      <Marker position = { this.props.position } 
                key = { this.props.key }
                icon = { this.props.icon }
                mouse = { this.props.mouse }
                ref = {(marker) =>{ console.log('update ref'); this.leafletElement = marker.leafletElement; console.log(marker); } }
      >
      </Marker>
    )
  }
}