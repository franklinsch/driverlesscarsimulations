import React from 'react';
import { Map, Marker, TileLayer, Popup } from 'react-leaflet';
import L from 'leaflet'
import CustomPropTypes from '../../Utils/CustomPropTypes.js'

export default class SimulationMap extends React.Component {

  static propTypes = {
    width: React.PropTypes.string,
    height: React.PropTypes.string,
    bounds: CustomPropTypes.bounds,
    simulationState: CustomPropTypes.simulationState.isRequired,
    handleAddJourney: React.PropTypes.func
  }

  constructor(props) {
    super(props);

    this.state = {
      origin: null,
      destination: null
    }
  }

  _handleMapClick(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    const position = {
      lat: lat,
      lng: lng
    }

    const origin = this.state.origin;

    if (origin) {
      this.setState({
        destination: position
      })
    } else {
      this.setState({
        origin: position
      })
    }
  }

  _handleJourneyCreate(journey) {
    const handleAddJourney = this.props.handleAddJourney;

    if (handleAddJourney) {
      handleAddJourney(journey);
    }

    this.setState({
      origin: null,
      destination: null
    })
  }

  _updateOriginMarkerPosition() {
    const originMarker = this.originMarker;
    if (!originMarker) {
      return
    }

    const { lat, lng } = originMarker.leafletElement.getLatLng();

    this.setState({
      origin: {
        lat: lat,
        lng: lng
      }
    })
  }

  _updateDestinationMarkerPosition() {
    const destinationMarker = this.destinationMarker;
    if (!destinationMarker) {
      return
    }

    const { lat, lng } = destinationMarker.leafletElement.getLatLng();

    this.setState({
      destination: {
        lat: lat,
        lng: lng
      }
    })
  }

  _clearOriginMarker() {
    this.setState({
      origin: null
    })
  }

  _clearDestinationMarker() {
    this.setState({
      destination: null
    })
  }

  _renderPopup() {
    const origin = this.state.origin;
    const destination = this.state.destination;

    const journey = {
      origin: origin,
      destination: destination
    }

    const position = {
      lat: destination.lat + 0.0001,
      lng: destination.lng
    }

    return (
      <Popup position={position}>
      <span>
      <p> Create new journey? </p>
      <button onClick={() => { this._handleJourneyCreate(journey) }}>Create</button>
      <button onClick={() => { this._clearDestinationMarker() }}> Clear destination </button> 
      </span>
      </Popup>
    )

  }

  render() {
    const style = {
      height: this.props.height || 300 + 'px',
      width: this.props.width || 300 + 'px'
    }

    const bounds = this.props.bounds;
    const cars = this.props.simulationState.objects;

    if (!bounds) {
      return (
        <p> Loading map... </p>
      )
    }

    const mapBounds = [bounds.southWest, bounds.northEast]

    const origin = this.state.origin;
    const destination = this.state.destination;

    const journey = {
      origin: origin,
      destination: destination
    }

    const carIcon = L.icon({
      iconUrl: "http://image.flaticon.com/icons/svg/226/226604.svg",
      iconSize: [22, 22],
    })

    const originMarkerIcon = L.icon({
      iconUrl: "http://image.flaticon.com/icons/svg/220/220283.svg",
      iconSize: [30, 30]
    })

    const destinationMarkerIcon = L.icon({
      iconUrl: "http://image.flaticon.com/icons/svg/220/220282.svg",
      iconSize: [30, 30]
    })

    return (
      <Map 
        bounds={mapBounds} 
        style={style} 
        onClick={(e) => { this._handleMapClick(e) }}
        closePopupOnClick={false}
      >
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
                icon = {carIcon}
              />
            )
          })
        }

      { 
        origin && 
        < Marker 
          position= { origin } 
          draggable
          onDragend={() => this._updateOriginMarkerPosition()}
          icon={originMarkerIcon}
          ref={(originMarker) => { this.originMarker = originMarker } }
        >
          <Popup>
            <button onClick={() => {this._clearOriginMarker()}}>
              Clear destination
            </button>
          </Popup>
        </Marker>
      }

      { 
        destination &&
        this._renderPopup() 
      }

      { 
        destination &&
          <Marker 
            position= { destination }
            draggable
            onDragend={() => {this._updateDestinationMarkerPosition()}}
            icon={destinationMarkerIcon}
            ref={(destinationMarker) => { this.destinationMarker = destinationMarker }}
          >
          {this._renderPopup()}
          </Marker>
      }
      </Map>
    );
  }

}
