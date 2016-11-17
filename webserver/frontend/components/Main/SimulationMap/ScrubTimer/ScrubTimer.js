import React, { PropTypes } from 'react';
import CustomPropTypes from '../../../Utils/CustomPropTypes.js'

export default class ScrubTimer extends React.Component {
  static propTypes = {
    timestamp: React.PropTypes.number,
    latestTimestamp: React.PropTypes.number,
    formattedTimestamp: React.PropTypes.string,
    handlers: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      scrubTime: this.props.timestamp
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.latestTimestamp == this.props.latestTimestamp || this.state.dragging) {
      return;
    }

    this.setState({
      scrubTime: nextProps.timestamp
    });
  }

  _handlePause(e) {
    this.setState({
      dragging: true,
      storedMax: this.props.latestTimestamp
    });
    this.props.handlers.handlePause();
  }

  _handleResume(e) {
    this.setState({
      dragging: false,
      storedMax: null
    });
    this.props.handlers.handleResume();
  }

  _handleScrubTimeChange(e) {
    const scrubTime = parseInt(e.target.value);
    this.setState({
      scrubTime: scrubTime
    });
    this.props.handlers.handleScrub(scrubTime);
  }

  render() {
    const scrubTime = this.state.scrubTime;
    const maxTimestamp = this.state.storedMax || this.props.latestTimestamp;
    const formattedTimestamp = this.props.formattedTimestamp;

    return (
      <div id="scrub-timer">
        <p> Simulation time: { formattedTimestamp } </p>
        <form>
          <div className="form-group">
            <div className="row">
              <input 
                className="form-group" type="range" min={0} max={maxTimestamp} step={1}
                value={scrubTime}
                onMouseDown={(e) => {this._handlePause(e)}}
                onMouseUp={(e) => {this._handleResume(e)}}
                onChange={(e) => {this._handleScrubTimeChange(e)}}
              />
            </div>
          </div>
        </form>
      </div>
    )
  }
}
