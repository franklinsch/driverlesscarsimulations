import React from 'react';
import { Map, Marker, TileLayer, Popup, GeoJson } from 'react-leaflet';
import L from 'leaflet'
import CustomPropTypes from '../../Utils/CustomPropTypes.jsx'
import RotatableMarker from './RotatableMarker/RotatableMarker.jsx'

export default class SimulationMap extends React.Component {
  static propTypes = {
    bounds: CustomPropTypes.bounds,
    simulationState: CustomPropTypes.simulationState.isRequired,
    previewMarkerPosition: CustomPropTypes.position,
    objectTypes: React.PropTypes.arrayOf(CustomPropTypes.typeInfo),
    selectedJourneyID: React.PropTypes.string,
    handlers: React.PropTypes.object
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
    if (newProps.selectedJourneyID != this.props.selectedJourneyID) {
      if (newProps.selectedJourneyID) {
        const associatedCar = this._getCarByJourneyID(newProps.selectedJourneyID);

        this.setState({
          clickedCar: associatedCar
        });
      } else {
        this.setState({
          clickedCar: null
        });
      }
    }

    const position = newProps.previewMarkerPosition
    if (!position || this.oldPreviewMarkerPosition && position === this.oldPreviewMarkerPosition) {
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
    const handleAddJourney = this.props.handlers.handleAddJourney;

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
      origin: null,
      destination: null
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

    let typeInfo = this.props.objectTypes[0];

    if (this.state.selectedObjectTypeName) {
      for (const objectType of this.props.objectTypes) {
        if (objectType.name === this.state.selectedObjectTypeName) {
          typeInfo = objectType
        }
      }
    }

    const journey = {
      origin: origin,
      destination: destination,
      typeInfo: typeInfo
    }

    const position = {
      lat: destination.lat + 0.0001,
      lng: destination.lng
    }

    const objectTypes = this.props.objectTypes || [];

    return (
      <Popup position={position}>
        <span>
          <p> Create new journey? </p>
          <div className="input-field">
            <select onChange={(e)=>{this.setState({selectedObjectTypeName: e.target.value})}}>
              {
                objectTypes.map((object) => {return object.name}).map((name, index) => {
                  return <option value={name} key={index}>{name}</option>
                })
              }
            </select>
          </div>
              <button onClick={() => { this._handleJourneyCreate(journey) }}>Create</button>
              <button onClick={() => { this._clearDestinationMarker() }}> Clear destination </button>

          </span>
      </Popup>
    )

  }

  handleCarMarkerClick(car, e) {
    this.setState({
      clickedCar: car
    });
  }

  componentDidMount() {
    $('select').material_select();
  }

  componentDidUpdate() {
    $('select').material_select();

    if (this.refs.map) {
      const map = this.refs.map.leafletElement;
      map.zoomControl.setPosition('topright')
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
  }

  _renderGeoJson() {
    // We use a random key so that on each change, the GeoJson is rerendered (GeoJson implementation is immutable)
    return this.state.clickedCar &&
      <GeoJson key={Math.random()} data={
        { "type": "FeatureCollection",
           "features": [
          {
            "type": "Feature",
              "geometry": {
                "type": "LineString",
                "coordinates": this.state.clickedCar.route
              }
          }
          ]
        }
      }
      />;
  }

  _getCarByJourneyID(journeyID) {
    const cars = this.props.simulationState.objects;

    for (let car of cars) {
      if (car.journeyID && car.journeyID == journeyID) {
        return car;
      }
    }

    return null;
  }

  render() {
    const heightInPx = $('#simulation-map').height();
    const widthInPx  = $('#simulation-map').width();

    const heightInVh = heightInPx / $(window).height() * 100;
    const widthInVh = widthInPx / $(window).width() * 100;
    const style = {
      height: heightInVh +'vh',
      width:  widthInVh + 'vw'
    }

    const cars = this.props.simulationState.objects;

    if (!this.props.bounds) {
      return (
        <div className="progress">
          <div className="indeterminate"></div>
        </div>)}

    const origin = this.state.origin;
    const destination = this.state.destination;

    const journey = {
      origin: origin,
      destination: destination
    }

    const icons = [L.icon({
      iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Circle_-_black_simple.svg/20px-Circle_-_black_simple.svg.png",
      iconSize: [20, 20]
    }), L.icon({
      iconUrl: "https://upload.wikimedia.org/wikipedia/commons/3/36/Map-icon-circle-black.png",
      iconSize: [20, 20]
    })]

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
        <Map
          style             = {style}
          onClick           = {::this._handleMapClick}
          ref               = 'map'
          closePopupOnClick = {false}
        >
          { this._renderGeoJson() }

          <TileLayer
            url         = 'https://api.mapbox.com/styles/v1/aminkaramlou/cixdq8dol003i2pr2877x0p3d/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1pbmthcmFtbG91IiwiYSI6ImNpeGRxNjByeTAwZzIydHMxNWNzbjRkN2MifQ.WBLGq6SKrd0wmdHEYFvq6Q'
            attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          {
            cars &&
            cars.map((car, index) => {
              const icon = icons[car.colourIndex];

              const key = car.colourIndex + "" + car.id;
              return (
                <RotatableMarker
                  position      = {car.position}
                  key           = {key}
                  icon          = {icon}
                  rotationAngle = {0}
                  handleClick   = {(e) => this.handleCarMarkerClick(car, e)}
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
              draggable
              position  = {origin}
              onDragend = {::this._updateOriginMarkerPosition}
              icon      = {originMarkerIcon}
              ref       = {(originMarker) => {this.originMarker = originMarker}}
            >
              <Popup>
                <button onClick = {::this._clearOriginMarker}>
                  Clear
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
              draggable
              position  = {destination}
              onDragend = {::this._updateDestinationMarkerPosition}
              icon      = {destinationMarkerIcon}
              ref       = {(destinationMarker) => {this.destinationMarker = destinationMarker}}
            >
              {this._renderPopup()}
            </Marker>
          }
        </Map>
      </div>
    );
  }
}