import React from 'react';
import JoinSimulationForm from './JoinSimulationForm/JoinSimulationForm.js';
import UtilFunctions from '../../Utils/UtilFunctions.js';

export default class Header extends React.Component {
  static propTypes = {
    socket: React.PropTypes.object,
    handleCityChange: React.PropTypes.func
  }

  _handleJoinSimulation(simulationID) {
    const socket = this.props.socket;

    const type = "request-simulation-join";
    const content = {
      simulationID: simulationID
    }

    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  render() {
    return (
        <nav className="navbar navbar-dark bg-primary">
          <a className="navbar-brand" href="#">SAVN</a>
          <ul className="nav navbar-nav">
              <li className="nav-item active">
                  <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
              </li>
              <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="http://example.com" id="supportedContentDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Choose map</a>
                  <div className="dropdown-menu" aria-labelledby="supportedContentDropdown">
                      <a className="dropdown-item" href="#">Action</a>
                      <a className="dropdown-item" href="#">Another action</a>
                      <a className="dropdown-item" href="#">Something else here</a>
                  </div>
              </li>
          </ul>
        
          <JoinSimulationForm onSubmit={(simID) => {this._handleJoinSimulation(simID)}} />
      </nav>
    )
  }
}
