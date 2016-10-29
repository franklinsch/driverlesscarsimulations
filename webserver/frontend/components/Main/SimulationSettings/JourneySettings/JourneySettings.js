import React from 'react';
import LandmarkSearch from './LandmarkSearch/LandmarkSearch.js';
import JourneyImport from './JourneyImport/JourneyImport.js';

export default class JourneySettings extends React.Component {

  static propTypes = {
    onSubmit: React.PropTypes.func,
    handlePositionSelect: React.PropTypes.func
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

    const handlePositionSelect = this.props.handlePositionSelect;

    if (!handlePositionSelect) {
      return
    }

    handlePositionSelect(position);
  }

  render() {
    const originLat = this.state.originLat;
    const originLng = this.state.originLng;
    const destinationLat = this.state.destinationLat;
    const destinationLng = this.state.destinationLng;

    return (
			<div id="journey-settings">
	      <div id="input-journeys">
	        <form>
	          <div className="form-group">
							<div className="row">
			          <input className="form-group" value={originLat} onChange={(e) => {this._handleOriginLatChange(e)}}/>
			          <input className="form-group" value={originLng} onChange={(e) => {this._handleOriginLngChange(e)}}/>
			          <input className="form-group" value={destinationLat} onChange={(e) => {this._handleDestinationLatChange(e)}}/>
			          <input className="form-group" value={destinationLng} onChange={(e) => {this._handleDestinationLngChange(e)}}/>
							</div>
							<div className="row">
			          <button className="btn btn-primary" type="submit" onClick={(e) => {this._handleJourneySubmit(e)}}>Add journey</button>
							</div>
	          </div>
	        </form>
				</div>
	        <LandmarkSearch
	          handlePositionAdd={(position) => {this._handlePositionAdd(position)}}
	        />
        <JourneyImport />
			</div>
    )
  }

}
