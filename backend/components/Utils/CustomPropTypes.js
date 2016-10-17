import React from 'react';

export default class CustomPropTypes {

  static _position = {
    lat: React.PropTypes.number.isRequired,
    lng: React.PropTypes.number.isRequired
  }

  static position = React.PropTypes.shape(CustomPropTypes._position);

  static _car = {
    id: React.PropTypes.string.isRequired,
    position: CustomPropTypes.position.isRequired
  }

  static car = React.PropTypes.shape(CustomPropTypes._car);

}
