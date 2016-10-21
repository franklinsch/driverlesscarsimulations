import React from 'react';

export default class JourneySettings extends React.Component {

  static propTypes = {
    onSubmit: React.PropTypes.function
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
    const destinationCurrentLat = this.state.destinationLat;
    const destinationCurrentLng = this.state.destinationLng;

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

    if (onSubmit) {
      onSubmit(journey)
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

  renderJourneysList() {
    const journeys = this.state.journeys;

    return (
      <ul>
      {
        journeys.map((journey, index) => {
          return (
            <li> { index + ": " + journey.lat + " " + journey.lng } </li>)
        })
      }
      </ul>
    )
  }


  render() {
    const originLat = this.state.originLat;
    const originLng = this.state.originLng;
    const destinationLat = this.state.destinationLat;
    const destinationLng = this.state.destinationLng;

    return (
      <div id="input-journeys">
        <form>
          <input value={originLat} onChange={(e) => {this._handleOriginLatChange()}}/>
          <input value={originLng} onChange={(e) => {this._handleOriginLngChange()}}/>
          <input value={destinationLng} onChange={(e) => {this._handleDesinationLatChange()}}/>
          <input value={destinationLng} onChange={(e) => {this._handleDestinationLngChange()}}/>
          <button type="submit" onClick={(e) => {this._handleJourneySubmit(e)}}>Add journey</button>
        </form>

        <h2> Journeys: </h2>
        { this.renderJourneysList() }
      </div>
    )
  }

}
