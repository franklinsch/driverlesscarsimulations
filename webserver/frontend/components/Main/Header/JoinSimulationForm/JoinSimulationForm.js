import React from 'react';

export default class JoinSimulationForm extends React.Component {

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
      <div id="input-join-simulation">
        <form className="form-inline float-xs-right">
          <input className="form-control" type="text" placeholder="Simulation ID" value={simulationID} onChange={(e) => {this._handleSimulationIDChange(e)}}/>
          <button className="btn btn-outline-success" type="submit" onClick={(e) => {this._handleJourneySubmit(e)}}>Join Simulation</button>
        </form>
      </div>
    )
  }

}
