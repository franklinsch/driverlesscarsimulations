import React from 'react';
import $ from 'jquery';

export default class LandmarkSearch extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      inputValue: ""
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

  search(query, callback) {
    $.ajax({
      url: "http://nominatim.openstreetmap.org/search",
      type: "GET",
      data: {
        q: query,
        format: "json"
      },
      success: (data) => {
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
      </div>
    )
  }

}
