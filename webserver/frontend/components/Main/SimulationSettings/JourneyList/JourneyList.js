import React from 'react';
import CustomPropTypes from '../../../Utils/CustomPropTypes.js';

export default class JourneyList extends React.Component {

  static propTypes = {
    journeys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney)
  }

  render() {
    const journeys = this.props.journeys || [];

    return (
      <div>
        <h4>Journeys</h4>
      { journeys.length == 0 &&
        <i> No journeys </i>
      }
        <ul>
        {
          journeys.map((journey, index) => {
            return (
              <li key={index}> { index + ": (" + journey.origin.lat + ", " + journey.origin.lng + ") -> (" + journey.destination.lat + ", " + journey.destination.lng + ")" } </li>)
          })
        }
        </ul>
      </div>
    )
  }
}
