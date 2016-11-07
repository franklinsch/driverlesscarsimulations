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

  static _bounds = {
    southWest: CustomPropTypes.position,
    northEast: CustomPropTypes.position
  }

  static bounds = React.PropTypes.shape(CustomPropTypes._bounds);

  static _city = {
    id: React.PropTypes.string,
    name: React.PropTypes.string,
    bounds: CustomPropTypes.bounds
  }

  static city = React.PropTypes.shape(CustomPropTypes._city);

  static _simulationInfo = {
    id: React.PropTypes.string,
    city: CustomPropTypes.city
  }

  static simulationInfo = React.PropTypes.shape(CustomPropTypes._simulationInfo);

  static _simulationObject = {
    id: React.PropTypes.string.isRequired,
    objectType: React.PropTypes.string.isRequired,
    position: CustomPropTypes.position.isRequired,
    typeInfo: React.PropTypes.shape({
      name: React.PropTypes.string,
      kindInfo: CustomPropTypes.simulationObjectKind
    })
  }

  static simulationObject = React.PropTypes.shape(CustomPropTypes._simulationObject)

  static _simulationState = {
    id: React.PropTypes.string,
    timestamp: React.PropTypes.number,
    formattedTimestamp: React.PropTypes.string,
    objects: React.PropTypes.arrayOf(CustomPropTypes.simulationObject)
  }

  static simulationState = React.PropTypes.shape(CustomPropTypes._simulationState);

  static _simulationJourney = {
    objectID: React.PropTypes.number,
    origin: CustomPropTypes.position,
    destination: CustomPropTypes.position
  }

  static simulationJourney = React.PropTypes.shape(CustomPropTypes._simulationJourney);

  static _osmSearchResult = {
    placeID: React.PropTypes.string,
    bounds: CustomPropTypes.bounds,
    position: CustomPropTypes.position,
    displayName: React.PropTypes.string
  }

  static osmSearchResult = React.PropTypes.shape(CustomPropTypes._osmSearchResult);

  static _simulationKindSetting = {
    name: React.PropTypes.string,
    kind: React.PropTypes.string, // 'text'/'predefined'
    value: React.PropTypes.string,
    allowedValues: React.PropTypes.arrayOf(React.PropTypes.string)
  }

  static simulationKindSetting = React.PropTypes.shape(CustomPropTypes._simulationKindSetting);

  static _simulationObjectKind = {
    name: React.PropTypes.string,
    parameters: React.PropTypes.arrayOf(CustomPropTypes.simulationKindSetting)
  }

  static simulationObjectKind = React.PropTypes.shape(CustomPropTypes._simulationObjectKind);
}
