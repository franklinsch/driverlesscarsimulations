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
      requestedSpeed: 1,
    }
  }

  _handleRequestedSpeedChange(e) {
    const value = e.target.value;

    let speed = 1;

    if (value < 4) {
      speed = value / 4;
    } else if (value > 4) {
      speed = Math.pow(2, value - 4);
    }

    this.setState({
      requestedSpeed: speed
    })

    const socket = this.props.socket;

    const type = 'request-simulation-speed-change';
    const content = {
      simulationSpeed: speed
    };

    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  render() {
    const requestedSpeed = this.state.requestedSpeed;

    let sliderValue = 4;

    if (requestedSpeed < 1) {
      sliderValue = requestedSpeed * 4;
    } else if (requestedSpeed > 1) {
      sliderValue = Math.log2(requestedSpeed) + 4;
    }

    return (
      <div id="speed-setting" hidden={this.props.hidden}>
        <form>
          <div className="form-group">
            <div className="row">
              <input className="form-group" type="range" min={0} max={9} step={1} value={sliderValue} onChange={(e) => {this._handleRequestedSpeedChange(e)}}/>
              <p>{requestedSpeed + "x"}</p>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
