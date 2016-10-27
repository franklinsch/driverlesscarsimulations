import React from 'react';
import $ from 'jquery';

export default class LandmarkSearch extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      inputValue: null
    }
  }

  handleChange(e) {
    this.setState({inputValue: e.target.value});  

    search(query, () => {});
  }

  handleSubmit(e) {

  }

  search(query, callback) {
    $.ajax({
      url: "http://nominatim.openstreetmap.org/search",
      type: "GET",
      data: {
        q: query
      },
      success: (data) => {
        console.log(data);
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
        onKeyPress={ (e) => { this.handleSubmit(e) }}
        />
        <button
        onClick={ (e) => { this.handleSubmit(e) }}
        />
      </div>
    )
  }

}
