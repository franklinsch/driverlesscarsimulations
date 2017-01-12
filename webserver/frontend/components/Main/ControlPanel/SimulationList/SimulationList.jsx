import React from 'react';
import 'whatwg-fetch';

export default class SimulationList extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('#simulations-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: true, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: true, // Displays dropdown below the button
        alignment: 'left' // Displays dropdown with edge aligned to the left of button
      }
    );
  }

  componentDidUpdate() {
    $('#simulations-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: true, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: true, // Displays dropdown below the button
        alignment: 'left' // Displays dropdown with edge aligned to the left of button
      }
    );
  } 

  render() {
    const simulations = this.props.simulations || [];
    if (simulations.length > 0) {
      return (
        <div>
          <a id="simulations-button" className="btn waves-effect waves-light dropdown-button" data-activates="simulations-dropdown">
            My Simulations
          </a>
          <ul id="simulations-dropdown" className="dropdown-content">
              {
                simulations.map((simulation, index) => {
                  const link = '#/simulations/' + simulation;
                  return (
                    <li key={ index }>
                      <a href={ link }> { simulation }</a>
                    </li>
                  );
                })
              }
          </ul>
        </div>
      );
    } else {
      return (<div></div>);
    }
  }
}
