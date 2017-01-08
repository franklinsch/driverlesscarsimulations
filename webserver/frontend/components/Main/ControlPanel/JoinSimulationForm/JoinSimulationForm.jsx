import React from 'react';

export default class JoinSimulationForm extends React.Component {

  static propTypes = {
    handlers: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      simulationID: "",
    }
  }

  _handleJoinSubmit(e) {
    e.preventDefault();

    const simulationID = this.state.simulationID;

    const handleSubmit = this.props.handlers.handleSubmit;

    if (handleSubmit) {
      handleSubmit(simulationID)
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
        <form>
          <div className="row">
              <div className="col s6"> 
                <input
                  className   = "validate"
                  type        = "text"
                  placeholder = "Joinable Simulation ID"
                  value       = {simulationID}
                  onChange    = {::this._handleSimulationIDChange}
                />
              </div>
              <div className="col s6">
                <button
                  className = "btn waves-effect waves-light"
                  type      = "submit"
                  onClick   = {::this._handleJoinSubmit}
                >
                  Join Simulation
                </button>
              </div>
            </div>
        </form>
    )
  }
}
