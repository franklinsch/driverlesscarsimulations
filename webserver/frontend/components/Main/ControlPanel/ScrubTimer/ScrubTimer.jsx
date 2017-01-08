import React, { PropTypes } from 'react';

export default class ScrubTimer extends React.Component {
  _timeoutValue = 200;
  _latestScrub = undefined;

  static propTypes = {
    timestamp: React.PropTypes.number,
    latestTimestamp: React.PropTypes.number,
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

  _checkScrub() {
    if (this._latestScrub != undefined) {
      this._scrubToTime(this._latestScrub);
      setTimeout(::this._checkScrub, this._timeoutValue);
    }
  }

  _handlePause(e) {
    this.setState({
      dragging: true,
      storedMax: this.props.latestTimestamp
    });
    this.props.handlers.handlePause();

    const scrubTime = parseInt(e.target.value);
    this._latestScrub = scrubTime;
    this._checkScrub();
  }

  _handleResume(e) {
    this.setState({
      dragging: false,
      storedMax: null
    });

    this._latestScrub = undefined;
    const scrubTime = parseInt(e.target.value);
    this._scrubToTime(scrubTime);
    this.props.handlers.handleResume();
  }

  _handleScrubTimeChange(e) {
    const scrubTime = parseInt(e.target.value);
    this._latestScrub = scrubTime;
  }

  _scrubToTime(scrubTime) {
    if (this.state.scrubTime != scrubTime) {
      this.setState({
        scrubTime: scrubTime
      });
      this.props.handlers.handleScrub(scrubTime);
    }
  }

  render() {
    const scrubTime = this.state.scrubTime;
    const maxTimestamp = this.state.storedMax || this.props.latestTimestamp;

    const d = this.props.timestamp;
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);
    const formattedTimestamp = ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);

    return (
      <div id="scrub-timer">
        <strong>Simulation Time</strong>: { formattedTimestamp } ({ d })
        <form>
          <div className="input-field">
            <p className="range-field">
              <input
                type        = "range"
                min         = {0}
                max         = {maxTimestamp}
                step        = {1}
                value       = {scrubTime}
                onMouseDown = {::this._handlePause}
                onMouseUp   = {::this._handleResume}
                onChange    = {::this._handleScrubTimeChange}
              />
              </p>
          </div>
        </form>
      </div>
    )
  }
}
