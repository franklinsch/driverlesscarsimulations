import React from "react";
import CustomPropTypes from "../../../Utils/CustomPropTypes.jsx";
import LandmarkSearch from "./LandmarkSearch/LandmarkSearch.jsx";
import JourneyImport from "./JourneyImport/JourneyImport.jsx";
import ObjectSettings from "./ObjectSettings/ObjectSettings.jsx";

export default class JourneySettings extends React.Component {

  static propTypes = {
    bounds: CustomPropTypes.bounds,
    simulationJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    objectTypes: React.PropTypes.arrayOf(CustomPropTypes.typeInfo),
    objectKindInfo: React.PropTypes.arrayOf(CustomPropTypes.kindInfo),
    handlers: React.PropTypes.object,
    activeSimulationID: React.PropTypes.string
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
    const handleJourneySelect = this.props.handlers.handleJourneysSelect;

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

  _toggleJourneyManualAddForm(e) {
    e.preventDefault();

    this.setState({
      showJourneyManualAddForm: !this.state.showJourneyManualAddForm
    })
  }

  _downloadSimulation() {
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', 'simulations/'+this.props.activeSimulationID+'/download');
    linkElement.click();
  }

  render() {
    const originLat = this.state.originLat;
    const originLng = this.state.originLng;
    const destinationLat = this.state.destinationLat;
    const destinationLng = this.state.destinationLng;

    const bounds = this.props.bounds;
    const showJourneyManualAddForm = this.state.showJourneyManualAddForm;

    const journeys = this.props.simulationJourneys;

    const landmarkSearchHandlers = {
      handlePositionAdd : this.props.handlers.handlePositionAdd
    }

    const journeyImportHandlers = {
      handleJourneysSubmit : this.props.handlers.handleJourneysFileImport
    }

    const objectSettingsHandlers = {
      handleSave : this.props.handlers.handleObjectCreate
    }

    return (
      <div id="journey-settings">
        <div id="input-journeys">
        </div>
        <LandmarkSearch
          boundLimit = {bounds}
          handlers   = {landmarkSearchHandlers}
        />
        <JourneyImport
          journeys = {journeys}
          handlers = {journeyImportHandlers}
        />

        <div className="row" id="simulation-download">
          <button className="btn waves-effect waves-light" onClick={::this._downloadSimulation}>Download Simulation Data</button>
        </div>

        <div className="row">
          <button
            className = "btn waves-effect waves-light"
            onClick   = {::this._toggleJourneyManualAddForm}
          >
            Manually add journey
          </button>

          { showJourneyManualAddForm &&
          <form>
            <div className="input-field">
              <input
                className = "validate"
                value     = {originLat}
                onChange  = {::this._handleOriginLatChange}
                placeholder = "Origin Latitude"
              />
            </div>
            <div className="input-field">
              <input
                className = "validate"
                value     = {originLng}
                onChange  = {::this._handleOriginLngChange}
                placeholder = "Origin Longitude"
              />
            </div>
            <div className="input-field">
              <input
                className = "validate"
                value     = {destinationLat}
                onChange  = {::this._handleDestinationLatChange}
                placeholder= "Destination Latitude"
              />
            </div>
            <div className="input-field">
              <input
                className = "validate"
                value     = {destinationLng}
                onChange  = {::this._handleDestinationLngChange}
                placeholder = "Destination Longitude"
              />
            </div>
            <button
              className = "btn waves-effect waves-light"
              type      = "submit"
              onClick   = {this._handleJourneySubmit}
            >
              Add journey
            </button>
          </form>
          }
        </div>
        <div className="row">
          <ObjectSettings
            objects={this.props.objectTypes}
            objectKindInfo={this.props.objectKindInfo}
            handlers={objectSettingsHandlers}
          />
        </div>
      </div>
    )
  }
}
