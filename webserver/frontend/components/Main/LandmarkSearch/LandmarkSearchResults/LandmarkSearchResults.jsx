import React from 'react';
import CustomPropTypes from '../../../Utils/CustomPropTypes.jsx';

export default class LandmarkSearchResults extends React.Component {

  static propTypes = {
    results: React.PropTypes.arrayOf(CustomPropTypes.osmSearchResult),
    handlers: React.PropTypes.object
  }


  render() {
    const results = this.props.results;

    return (
      <ul id="search-results" className="collection">
        {
          results.map((result, index) => {
            return (
                <a key={index} className="collection-item"
                  href    = "#"
                  onClick = {() => this.props.handlers.handleResultSelect(result)}
                >
                  { result.displayName }
                </a>
            )
          }).slice(0,5)
        }
      </ul> 
    )
  }
}
