import React from 'react';
import CustomPropTypes from '../../../../Utils/CustomPropTypes.js';

export default class LandmarkSearchResults extends React.Component {

  static propTypes = {
    results: React.PropTypes.arrayOf(CustomPropTypes.osmSearchResult),
    handleResultSelect: React.PropTypes.func
  }

  _handleResultSelect(result) {
    this.props.handleResultSelect(result);
  }

  render() {
    const results = this.props.results;

    return(
      <ul>
      {
        results.map((result, index) => {
          return (
            <li key={index}> 
              <a href="#" onClick={() => {this._handleResultSelect(result)}}>
               { result.displayName }
              </a>
            </li>
          )
        })
      }
      </ul> 
    )
  }

}
