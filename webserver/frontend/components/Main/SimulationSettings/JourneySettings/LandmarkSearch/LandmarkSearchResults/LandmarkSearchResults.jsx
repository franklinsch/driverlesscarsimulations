import React from 'react';
import CustomPropTypes from '../../../../../Utils/CustomPropTypes.jsx';

export default class LandmarkSearchResults extends React.Component {

  static propTypes = {
    results: React.PropTypes.arrayOf(CustomPropTypes.osmSearchResult),
    handlers: React.PropTypes.object
  }

  render() {
    const results = this.props.results;

    return (
      <ul>
        {
          results.map((result, index) => {
            return (
              <li key={index}> 
                <a 
                  href    = "#"
                  onClick = {() => this.props.handlers.handleResultSelect(result)}
                >
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
