import React from 'react';
import CustomPropTypes from '../../../Utils/CustomPropTypes.js';
import LandmarkSearch from './LandmarkSearch/LandmarkSearch.js';
import JourneyImport from './JourneyImport/JourneyImport.js';

export default class JourneySettings extends React.Component {

  static propTypes = {
    bounds: CustomPropTypes.bounds,
    handleJourneysSelect: React.PropTypes.func,
    handlePositionSelect: React.PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      originLat: "",
      originLng: "",
      destinationLat: "",
      destinationLng: "",
      journeys: [],
      showJourneyManualAddForm: false
    }
  }

  _handleJourneySubmit(e) {
    e.preventDefault();

    const originLat = this.state.originLat;
    const originLng = this.state.originLng;
    const destinationLat = this.state.destinationLat;
    const destinationLng = this.state.destinationLng;

    const handleJourneySelect = this.props.handleJourneysSelect;

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

    if (handleJourneySelect) {
      handleJourneySelect(journeys)
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

  _handleJourneysFileImport(journeys) {
    this.props.handleJourneysSelect(journeys);
  }

  _toggleJourneyManualAddForm(e) {
    e.preventDefault();

    this.setState({
      showJourneyManualAddForm: !this.state.showJourneyManualAddForm
    })
  }

  render() {
    const originLat = this.state.originLat;
    const originLng = this.state.originLng;
    const destinationLat = this.state.destinationLat;
    const destinationLng = this.state.destinationLng;

    const bounds = this.props.bounds;
    const showJourneyManualAddForm = this.state.showJourneyManualAddForm;

    return (
      <div id="journey-settings">
	      <div id="input-journeys">
				</div>
	        <LandmarkSearch
	          handlePositionAdd={(position) => {this._handlePositionAdd(position)}}
            boundLimit={bounds}
	        />
	        <form>
	          <div className="form-group">
              <button onClick={(e) => this._toggleJourneyManualAddForm(e)}>Manually add journey</button>
              { showJourneyManualAddForm &&
                <div className="row">
                  <input className="form-group" value={originLat} onChange={(e) => {this._handleOriginLatChange(e)}}/>
                  <input className="form-group" value={originLng} onChange={(e) => {this._handleOriginLngChange(e)}}/>
                  <input className="form-group" value={destinationLat} onChange={(e) => {this._handleDestinationLatChange(e)}}/>
                  <input className="form-group" value={destinationLng} onChange={(e) => {this._handleDestinationLngChange(e)}}/>
                  <button className="btn btn-primary" type="submit" onClick={(e) => {this._handleJourneySubmit(e)}}>Add journey</button>
                </div>
              }
	          </div>
	        </form>
        <JourneyImport 
          handleJourneysSubmit={(journeys) => this._handleJourneysFileImport(journeys)}
        />
      </div>
    )
  }

}
