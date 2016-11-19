import React from 'react';
import CustomPropTypes from '../../../Utils/CustomPropTypes.jsx';

export default class JourneyList extends React.Component {

  static propTypes = {
    simulationJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    pendingJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    handleJourneyMouseOver: React.PropTypes.func,
    handleJourneyMouseOut: React.PropTypes.func,
  }

  render() {
    const simulationJourneys = this.props.simulationJourneys || [];
    const pendingJourneys = this.props.pendingJourneys || [];

    return (
      <div id="journey-list">
        <h4>Journeys</h4>
        { (simulationJourneys.length == 0 && pendingJourneys.length == 0) &&
          <i> No journeys </i>
        }
        <ul>
          {
            simulationJourneys.map((journey, index) => {
              return (
                <li key={index} mouseOver={::handleJourneyMouseOver} mouseOut={::handleJourneyMouseOut}>
                  { index + ": (" + journey.origin.lat + ", " + journey.origin.lng + ") -> (" + journey.destination.lat + ", " + journey.destination.lng + ")" } 
                </li>
              )
            })
          }
        </ul>
        <ul>
          {
            pendingJourneys.map((journey, index) => {
              return (
                <li key={index}>
                  { "(Pending) " + index + ": (" + journey.origin.lat + ", " + journey.origin.lng + ") -> (" + journey.destination.lat + ", " + journey.destination.lng + ")" } 
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}
