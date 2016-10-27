import React from 'react';
import LandmarkSearch from '../LandmarkSearch/LandmarkSearch.js';

export default class JourneySettings extends React.Component {

  static propTypes = {
    onSubmit: React.PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      originLat: "",
      originLng: "",
      destinationLat: "",
      destinationLng: "",
      journeys: []
    }
  }

  _handleJourneySubmit(e) {
    e.preventDefault();

    const originLat = this.state.originLat;
    const originLng = this.state.originLng;
    const destinationLat = this.state.destinationLat;
    const destinationLng = this.state.destinationLng;

    const onSubmit = this.props.onSubmit;

    const journey = {
      // TODO
      carID: "0",
      origin: {
        lat: originLat,
        lng: originLng
      },
      destination: {
        lat: destinationLat,
        lng: destinationLng
      }
    }

    const journeys = this.state.journeys.concat([journey]);

    this.setState({
      journeys: journeys
    })

    if (onSubmit) {
      onSubmit(journeys)
    }
  }

  _handleOriginLatChange(e) {
    this.setState({
      originLat: e.target.value
    })
  }

  _handleOriginLngChange(e) {
    this.setState({
      originLng: e.target.value
    })
  }

  _handleDestinationLatChange(e) {
    this.setState({
      destinationLat: e.target.value
    })
  }

  _handleDestinationLngChange(e) {
    this.setState({
      destinationLng: e.target.value
    })
  }

  _handlePositionAdd(position) {
    const originLat = this.state.originLat;

    if (!originLat) {
      this.setState({
        originLat: position.lat.toString(),
        originLng: position.lng.toString()
      })
    } else {
      this.setState({
        destinationLat: position.lat.toString(),
        destinationLng: position.lng.toString()
      })
    }
  }

  render() {
    const originLat = this.state.originLat;
    const originLng = this.state.originLng;
    const destinationLat = this.state.destinationLat;
    const destinationLng = this.state.destinationLng;

    return (
      <div id="input-journeys">
        <form>
          <input value={originLat} onChange={(e) => {this._handleOriginLatChange(e)}}/>
          <input value={originLng} onChange={(e) => {this._handleOriginLngChange(e)}}/>
          <input value={destinationLat} onChange={(e) => {this._handleDestinationLatChange(e)}}/>
          <input value={destinationLng} onChange={(e) => {this._handleDestinationLngChange(e)}}/>
          <button type="submit" onClick={(e) => {this._handleJourneySubmit(e)}}>Add journey</button>
        </form>
        <LandmarkSearch 
          handlePositionAdd={(position) => {this._handlePositionAdd(position)}}
        />
      </div>
    )
  }

}
