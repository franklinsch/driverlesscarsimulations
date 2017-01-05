import React from 'react';

export default class APIKeysModal extends React.Component {

  static propTypes = {
    handlers: React.PropTypes.object,
    apiKeys: React.PropTypes.array,
    newAPIKey: React.PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      newAPIKeyTitle: ''
    };
  }

  _updateNewAPIKeyTitle(e) {
    this.setState({
      newAPIKeyTitle: e.target.value
    });
  }

  _addAPIKey() {
      this.props.handlers.handleAddAPIKey(this.state.newAPIKeyTitle, 1);
  }

  render() {
      const newAPIKey = this.props.newAPIKey;

      return (
        <table>
          <thead>
            <tr>
                <th>Title</th>
                <th>API Key</th>
                <th>Associated Simulation</th>
                <th></th>
           </tr>
          </thead>

          <tbody>
            {
              this.props.apiKeys.map((apiKey, index) => {
                return (
                  <tr key={apiKey._id}>
                    <td>{apiKey.title}</td>
                    <td>{newAPIKey && newAPIKey._id == apiKey._id && newAPIKey.apiKey}</td>
                    <td>sim</td>
                    <td></td>
                  </tr>
                )
              })
            }
            <tr>
              <td>
                <input placeholder="Title" id="new_api_key_title" type="text" className="validate" onChange={::this._updateNewAPIKeyTitle} />
              </td>
              <td></td>
              <td></td>
              <td><a className="waves-effect waves-light btn" onClick={::this._addAPIKey}>Add</a></td>
            </tr>
          </tbody>
        </table>
      );
  }
}
