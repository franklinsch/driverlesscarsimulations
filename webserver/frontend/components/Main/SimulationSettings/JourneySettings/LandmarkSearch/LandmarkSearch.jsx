import React from 'react';
import $ from 'jquery';
import CustomPropTypes from '../../../../Utils/CustomPropTypes.jsx';
import LandmarkSearchResults from './LandmarkSearchResults/LandmarkSearchResults.jsx';

export default class LandmarkSearch extends React.Component {

  static propTypes = {
    boundLimit: CustomPropTypes.bounds,
    handlers: React.PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      inputValue: "",
      searchResults: []
    }
  }

  _handleChange(e) {
    const input = e.target.value;
    this.setState({inputValue: input});
  }

  _handleSubmit(e) {
    const input = this.state.inputValue;

    this.search(input, () => {});
  }

  _toOSMSearchResults(data) {
    const bbox = data.boundingbox;

    return {
      placeID: data.place_id,
      bounds: {
        southWest: {
          lat: parseFloat(bbox[0]),
          lng: parseFloat(bbox[2])
        },
        northEast: {
          lat: parseFloat(bbox[1]),
          lng: parseFloat(bbox[3])
        }
      },
      position: {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon)
      },
      displayName: data.display_name
    }
  }

  handleResultSelect(result) {
    console.log(result);
    this.props.handlers.handlePositionAdd(result.position);
  }

  search(query, callback) {
    const bounds = this.props.boundLimit;
    let viewBox = "";

    if (bounds) {
      viewBox = bounds.southWest.lng + "," + bounds.southWest.lat + "," + bounds.northEast.lng + "," + bounds.northEast.lat
    }

    $.ajax({
      url: "http://nominatim.openstreetmap.org/search",
      type: "GET",
      data: {
        q: query,
        format: "json",
        viewboxlbrt: viewBox,
        bounded: "1"
      },
      success: (data) => {
        const results = data.map((result) => {
          return this._toOSMSearchResults(result);
        });
        this.setState({searchResults: results});
      }
    })
  }

  render() {
    const landmarkSearchResultsHandlers = {
      handleResultSelect : ::this.handleResultSelect
    }

    return (
      <div>
        <div className="input-field">
          <input
            type        = 'text'
            className   = "form-control"
            id          = "landmark-search"
            placeholder = 'Search name or address'
            value       = {this.state.inputValue}
            onChange    = {::this._handleChange}
            onKeyPress  = {::this._handleSubmit}
          />
          <LandmarkSearchResults
            results  = {this.state.searchResults}
            handlers = {landmarkSearchResultsHandlers}
          />
        </div>
      </div>
    )
  }
}
