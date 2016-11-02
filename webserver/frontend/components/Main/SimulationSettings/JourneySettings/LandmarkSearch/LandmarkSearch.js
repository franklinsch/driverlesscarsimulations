import React from 'react';
import $ from 'jquery';
import CustomPropTypes from '../../../../Utils/CustomPropTypes.js';
import LandmarkSearchResults from './LandmarkSearchResults.js';

export default class LandmarkSearch extends React.Component {

  static propTypes = {
    handlePositionAdd: React.PropTypes.func,
    boundLimit: CustomPropTypes.bounds
  }

  constructor(props) {
    super(props);

    this.state = {
      inputValue: "",
      searchResults: []
    }
  }

  handleChange(e) {
    const input = e.target.value;
    this.setState({inputValue: input});
  }

  handleSubmit(e) {
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

  _handleResultSelect(result) {
    this.props.handlePositionAdd(result.position);
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
    return (
      <div className="container">
				<div className="row">
					<input
						type='text'
						className="form-control"
            id="landmark-search"
            placeholder='Search name or address'
						value={this.state.inputValue}
						onChange={ (e) => { this.handleChange(e) }}
						onKeyPress={ (e) => { this.handleSubmit(e) }}
						/>
					<LandmarkSearchResults results={this.state.searchResults} handleResultSelect={(result) => { this._handleResultSelect(result) }}/>
				</div>
      </div>
    )
  }

}
