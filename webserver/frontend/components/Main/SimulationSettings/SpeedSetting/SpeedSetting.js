import React from 'react';
import UtilFunctions from '../../..//Utils/UtilFunctions.js';
import CustomPropTypes from '../../../Utils/CustomPropTypes.js';

export default class SpeedSetting extends React.Component {

  static propTypes = {
    hidden: React.PropTypes.bool,
    socket: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      requestedSpeed: "",
    }
  }

  _handleSpeedChangeSubmit(e) {
    e.preventDefault();

    const socket = this.props.socket;
    const requestedSpeed = this.state.requestedSpeed;

    const type = 'request-simulation-speed-change';
    const content = {
      simulationSpeed: parseFloat(requestedSpeed)
    };

    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  _handleRequestedSpeedChange(e) {
    this.setState({
      requestedSpeed: e.target.value
    })
  }

  render() {
    const requestedSpeed = this.state.requestedSpeed;

    return (
      <div id="speed-setting" hidden={this.props.hidden}>
        <form>
          <div className="form-group">
            <div className="row">
              <input className="form-group" value={requestedSpeed} onChange={(e) => {this._handleRequestedSpeedChange(e)}}/>
              <button className="btn btn-primary" type="submit" onClick={(e) => {this._handleSpeedChangeSubmit(e)}}>Change speed</button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
