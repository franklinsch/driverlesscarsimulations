import React from 'react';
import { Map, Marker, TileLayer, Popup, GeoJson } from 'react-leaflet';
import L from 'leaflet'
import CustomPropTypes from '../../Utils/CustomPropTypes.js'
import RotatableMarker from './RotatableMarker'

export default class SimulationMap extends React.Component {

  static propTypes = {
    width: React.PropTypes.string,
    height: React.PropTypes.string,
    bounds: CustomPropTypes.bounds,
    simulationState: CustomPropTypes.simulationState.isRequired,
    handleAddJourney: React.PropTypes.func,
    previewMarkerPosition: CustomPropTypes.position,
    clearPreviewMarkerPosition: React.PropTypes.func
  }

  constructor(props) {
    super(props);

    this.state = {
      origin: null,
      destination: null,
      clickedCar: null
    }
  }

  componentWillReceiveProps(newProps) {
    const position = newProps.previewMarkerPosition

    if (this.oldPreviewMarkerPosition && position === this.oldPreviewMarkerPosition) {
      return
    }

    this.oldPreviewMarkerPosition = position;

    this._updateMarker(position);
  }

  _handleMapClick(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    const position = {
      lat: lat,
      lng: lng
    }

    this._updateMarker(position);

    // If one clicks on the map, the currently clicked car isn't active anymore
    this.setState({
      clickedCar: null
    });
  }

  _updateMarker(position) {
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

  _handleCarMarkerClick(car, e) {
    this.setState({ clickedCar: car });
  }

  componentDidUpdate() {
    const map = this.refs.map.leafletElement;
    const bounds = this.props.bounds;
    const mapBounds = [bounds.southWest, bounds.northEast];

    if (this.bounds != bounds) {
      map.options.minZoom = 0;
      map.fitBounds(mapBounds);
      map.options.minZoom = map.getZoom();
      map.zoomControl._zoomOutButton.classList.add("leaflet-disabled"); //This MAY be hacky
      this.bounds = bounds;
    }
  }

  render() {
    const style = {
      height: this.props.height || 300 + 'px',
      width: this.props.width || 300 + 'px'
    }

    const cars = this.props.simulationState.objects;

    if (!this.props.bounds) {
      return (
        <p> Loading map... </p>
      )
    }

    const origin = this.state.origin;
    const destination = this.state.destination;

    const journey = {
      origin: origin,
      destination: destination
    }

    const carIcon = L.icon({
      iconUrl: "/car-icon.png",
      iconSize: [35, 35],
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
      <div>
      <p> Simulation time: { this.props.simulationState.formattedTimestamp } </p>
      <Map 
        style={style} 
        onClick={(e) => { this._handleMapClick(e) }}
        ref='map'
        closePopupOnClick={false}
      >
        { this.state.clickedCar && 
          <GeoJson key={Math.random()} data={
          { "type": "FeatureCollection",
    "features": [
      { "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": this.state.clickedCar.route
        } } ] } } />
        }

        <TileLayer
        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {
          cars &&
          cars.map((car, index) => {
            const key = car.id
            return (
              <RotatableMarker position={car.position} 
                key={key}
                icon={carIcon}
                rotationAngle={car.direction}
                handleMouseOver={(e) => this._handleCarMarkerClick(car, e) }
              >
                <Popup>
                  <div>
                  <dl>
                    <dt>Speed</dt>
                    <dd>{ car.speed }</dd>
                  </dl>
                  <dl>
                    <dt>Direction</dt>
                    <dd>{ car.direction }</dd>
                  </dl>
                  </div>
                </Popup>
              </RotatableMarker>
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
      </div>
    );
  }

}
