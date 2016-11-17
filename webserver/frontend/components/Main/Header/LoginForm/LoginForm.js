import React from 'react';

export default class LoginButton extends React.Component {

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
      <div>
      <a className="nav-link dropdown-toggle" href="http://example.com" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Dropdown link
      </a>
      <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
        <a className="dropdown-item" href="#">Action</a>
        <a className="dropdown-item" href="#">Another action</a>
        <a className="dropdown-item" href="#">Something else here</a>
      </div>
      </div>
    )
  }

}
