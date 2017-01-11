import React from 'react';
import CustomPropTypes from '../../../Utils/CustomPropTypes.jsx';

export default class JourneyList extends React.Component {

  static propTypes = {
    simulationJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    pendingJourneys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    handlers: React.PropTypes.object
  }

  componentDidMount() {
    $('.collapsible').collapsible();
  }

  render() {
    const simulationJourneys = this.props.simulationJourneys || [];
    const pendingJourneys = this.props.pendingJourneys || [];

    return (
      <div className="row" id="journey-list">
        <ul className="collapsible">
          <li>
            <div className="collapsible-header">
              Show current journeys
            </div>
            <div className="collapsible-body">
              <table className="striped">
                <thead>
                  <tr>
                    <th data-field="origin">Origin</th>
                    <th data-field="destination">Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    pendingJourneys.map((journey,index) => {
                      const originLatString = journey.origin.lat + ""
                      const originLat = originLatString.substring(0, 6)

                      const originLngString = journey.origin.lng + ""
                      const originLng = originLngString.substring(0, 6)

                      const destinationLatString = journey.destination.lat + ""
                      const destinationLat = destinationLatString.substring(0, 6)

                      const destinationLngString = journey.destination.lng + ""
                      const destinationLng = destinationLngString.substring(0, 6)

                      return (
                        <tr
                          onMouseEnter={(e) => this.props.handlers.handleJourneyMouseOver(journey, e)}
                          onMouseLeave={(e) => this.props.handlers.handleJourneyMouseOut(journey, e)}
                          key={index}
                        >
                          <td key={index+"o"}>{"(" + originLat + ", " + originLng + ")"}</td> 
                          <td key={index+"d"}>{"(" + destinationLat + ", " + destinationLng + ")"}</td> 
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
              <table className="striped">
                <tbody>
                  {
                    simulationJourneys.map((journey,index) => {
                      const originLatString = journey.origin.lat + ""
                      const originLat = originLatString.substring(0, 6)

                      const originLngString = journey.origin.lng + ""
                      const originLng = originLngString.substring(0, 6)

                      const destinationLatString = journey.destination.lat + ""
                      const destinationLat = destinationLatString.substring(0, 6)

                      const destinationLngString = journey.destination.lng + ""
                      const destinationLng = destinationLngString.substring(0, 6)

                      return (
                        <tr
                          onMouseEnter={(e) => this.props.handlers.handleJourneyMouseOver(journey, e)}
                          onMouseLeave={(e) => this.props.handlers.handleJourneyMouseOut(journey, e)}
                          key={index}
                        >
                          <td key={index+"o"}>{"(" + originLat + ", " + originLng + ")"}</td> 
                          <td key={index+"d"}>{"(" + destinationLat + ", " + destinationLng + ")"}</td> 
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>
          </li>
        </ul>
      </div>
    )
  }
}
