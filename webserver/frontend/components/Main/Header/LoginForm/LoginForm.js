import React from 'react';

export default class LoginForm extends React.Component {

  static propTypes = {
    onSubmit: React.PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      simulationID: "",
    }
  }

  _handleJourneySubmit(e) {
    e.preventDefault();

    const simulationID = this.state.simulationID;

    const onSubmit = this.props.onSubmit;

    if (onSubmit) {
      onSubmit(simulationID)
    }
  }

  _handleSimulationIDChange(e) {
    this.setState({
      simulationID: e.target.value
    })
  }

  render() {
    const simulationID = this.state.simulationID;

    return (
      <div id="login-button">
        <form className="form-inline float-xs-right">
          <button className="btn btn-success" type="submit" onClick={(e) => {this._handleJourneySubmit(e)}}>Login</button>
        </form>
      </div>
    )
  }

}
