import React from 'react';
import UtilFunctions from '../../..//Utils/UtilFunctions.jsx';
import CustomPropTypes from '../../../Utils/CustomPropTypes.jsx';

export default class SpeedSetting extends React.Component {

  static propTypes = {
    hidden: React.PropTypes.bool,
    handlers: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      requestedSpeed: 1
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

    this.props.handlers.handleSpeedChange(speed);

    this.setState({
      requestedSpeed: speed
    })
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
          <div className="input-field">
            <div className="row">
              <input 
                className = "input-field"
                type      = "range"
                min       = {0}
                max       = {9}
                step      = {1}
                value     = {sliderValue}
                onChange  = {::this._handleRequestedSpeedChange}
              />
              <p>{requestedSpeed + "x"}</p>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
