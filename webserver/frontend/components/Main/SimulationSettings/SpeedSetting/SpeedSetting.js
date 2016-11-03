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

  static speeds = [0.5, 1, 2, 4, 8, 20, 50]

  _handleSpeedChangeSubmit() {
    const socket = this.props.socket;
    const requestedSpeed = this.state.requestedSpeed;

    const type = 'request-simulation-speed-change';
    const content = {
      simulationSpeed: requestedSpeed
    };

    UtilFunctions.sendSocketMessage(socket, type, content);
  }

  _handleRequestedSpeedChange(e) {
    const value = e.target.value;

    let speed = 1;

    if (value < 5) {
      speed = value / 4;
    } else if (value > 5) {
      speed = Math.pow(2, value - 5);
    }

    //0-5: 0.0 0.25 0.5 0.75
    //5: 1
    //5-10: 2 4 8 16

    this.setState({
      requestedSpeed: speed
    })

    this._handleSpeedChangeSubmit();
  }

  render() {
    const requestedSpeed = this.state.requestedSpeed;

    let sliderValue = 5;

    if (requestedSpeed < 1) {
      sliderValue = requestedSpeed * 4;
    } else if (requestedSpeed > 1) {
      sliderValue = Math.log2(requestedSpeed) + 5;
    }

    return (
      <div id="speed-setting" hidden={this.props.hidden}>
        <form>
          <div className="form-group">
            <div className="row">
              <input className="form-group" type="range" min={0} max={10} step={1} value={sliderValue} onChange={(e) => {this._handleRequestedSpeedChange(e)}}/>
              <p>{requestedSpeed + "x"}</p>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
