import React from 'react';
import CustomPropTypes from '../../../Utils/CustomPropTypes.js';

export default class LandmarkSearchResults extends React.Component {

  static propTypes = {
    results: CustomPropTypes.osmSearchResult
  }

  render() {
    <ul>
      {
        results.map((result, index) => {
          return (
            <li key={index}> result.displayName </li>
          )
        })
      }
    </ul> 
  }

}
