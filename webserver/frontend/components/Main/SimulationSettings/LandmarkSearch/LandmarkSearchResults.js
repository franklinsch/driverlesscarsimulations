import React from 'react';
import CustomPropTypes from '../../../Utils/CustomPropTypes.js';

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
            <a onClick={(result) => {this._handleResultSelect(result)}}>
              <li key={index}> { result.displayName } </li>
            </a>
          )
        })
      }
      </ul> 
    )
  }

}
