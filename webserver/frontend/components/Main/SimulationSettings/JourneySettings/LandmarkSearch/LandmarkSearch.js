import React from 'react';
import $ from 'jquery';
import LandmarkSearchResults from './LandmarkSearchResults.js';

export default class LandmarkSearch extends React.Component {

  static propTypes = {
    handlePositionAdd: React.PropTypes.func
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
    $.ajax({
      url: "http://nominatim.openstreetmap.org/search",
      type: "GET",
      data: {
        q: query,
        format: "json"
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
						className="form-group"
						value={this.state.inputValue}
						onChange={ (e) => { this.handleChange(e) }}
						onKeyPress={ (e) => { this.handleSubmit(e) }}
						/>
				</div>
				<div className="row">
					<button className="btn btn-primary" onClick={ (e) => { this.handleSubmit(e) }} >Search</button>
					<LandmarkSearchResults results={this.state.searchResults} handleResultSelect={(result) => { this._handleResultSelect(result) }}/>
				</div>
      </div>
    )
  }

}
