import React from 'react';

export default class LandmarkSearch extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      inputValue: null
    }
  }

  handleChange(e) {
    this.setState({inputValue: e.target.value});  
  }

  handleSubmit(e) {

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
