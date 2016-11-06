import React from 'react';

export default class ObjectSettings extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showSettings: true
    }
  }

  _toggleShow() {
    this.setState({
      showSettings: !this.state.showSettings
    })
  }

  render() {
    return (
      <div id="object-settings">
        <button className="btn btn-primary" onClick={::this._toggleShow}>Show</button>
        {
          this.state.showSettings &&
          <button className="btn btn-secondary">Add object</button>
        }
      </div>
    )
  }
}
