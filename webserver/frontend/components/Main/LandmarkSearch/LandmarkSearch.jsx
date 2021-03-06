import React from "react";
import $ from "jquery";
import CustomPropTypes from "../../Utils/CustomPropTypes.jsx";
import LandmarkSearchResults from "./LandmarkSearchResults/LandmarkSearchResults.jsx";

const onClickOutside = require('react-onclickoutside');

const ResultsWrapper = onClickOutside(LandmarkSearchResults);

export default class LandmarkSearch extends React.Component {

  static propTypes = {
    boundLimit: CustomPropTypes.bounds,
    handlers: React.PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      inputValue: "",
      searchResults: [],
      hidden: true,
    }
  }

  _showResults() {
    this.setState({hidden: false});
  }

  _hideResults() {
    this.setState({hidden: true})
  }

  _handleChange(e) {
    const input = e.target.value;
    this._showResults();
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
      displayName: data.display_name.slice(0,135)
    }
  }

  handleResultSelect(result) {
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
        })
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
        <div className="input-field ">
          <input
            type        = 'search'
            className   = "form-control"
            id          = "landmark-search"
            placeholder = "Find an address"
            value       = {this.state.inputValue}
            onChange    = {::this._handleChange}
            onKeyPress  = {::this._handleSubmit}
          />
          <label htmlFor="landmark-search">
            <i className="material-icons"> search </i>
          </label>
        </div>
        {
          !this.state.hidden &&
          <ResultsWrapper
            hide={e => this._hideResults()}
            results={this.state.searchResults}
            handlers={landmarkSearchResultsHandlers}
          />
        }
      </div>
    )
  }
}
