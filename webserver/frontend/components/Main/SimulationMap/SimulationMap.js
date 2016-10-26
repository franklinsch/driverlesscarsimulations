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
      destination: null,
      showJourneyMarkers: false
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

    this.setState({
      showJourneyMarkers: true
    })
  }

  _handleJourneyCreate(journey) {
    const handleAddJourney = this.props.handleAddJourney;

    if (handleAddJourney) {
      handleAddJourney(journey);
    }

    this.setState({
      showJourneyMarkers: false,
      origin: null,
      destination: null
    })
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

    const showJourneyMarkers = this.state.showJourneyMarkers;

    const origin = this.state.origin;
    const destination = this.state.destination;

    const journey = {
      origin: origin,
      destination: destination
    }


    return (
      <Map 
        bounds={mapBounds} 
        style={style} 
        onClick={(e) => { this._handleMapClick(e) }}
      >
        <TileLayer
        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {
          cars &&
          cars.map((car, index) => {
            const key = car.position.lat.toString() + car.position.lng.toString()
            const carIcon = L.icon({
              iconUrl: "http://image.flaticon.com/icons/svg/226/226604.svg",
              iconSize: [22, 22],
            })
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
        <Marker position= { origin } />
      }

      { 
        destination &&
          <Marker position= { destination }>
          <Popup>
          <div>
          <p> Create new journey? </p>
          <button onClick={() => { this._handleJourneyCreate(journey) }}>Create</button>
          </div>
          </Popup>
          </Marker>
      }

      </Map>
    );
  }

}
