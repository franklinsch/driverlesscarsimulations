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
      placeID: data.placeID,
      bounds: {
        southWest: {
          lat: parseInt(bbox[0]),
          lng: parseInt(bbox[2])
        },
        northEast: {
          lat: parseInt(bbox[1]),
          lng: parseInt(bbox[3])
        }
      },
      position: {
        lat: parseInt(data.lat),
        lng: parseInt(data.lng)
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
      <div>
        <input
        type='text'
        value={this.state.inputValue} 
        onChange={ (e) => { this.handleChange(e) }}
        />
        <button onClick={ (e) => { this.handleSubmit(e) }} >Search</button>
        <LandmarkSearchResults results={this.state.searchResults} handleResultSelect={(result) => { this._handleResultSelect(result) }}/>
      </div>
    )
  }

}
