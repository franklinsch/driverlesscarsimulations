import React from 'react';
import 'whatwg-fetch';

export default class LoginButton extends React.Component {

  static propTypes = {
    token: React.PropTypes.string,
    handlers: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      token: this.props.token
    };
  }
 
  _handleUserChange(e) {
    this.setState({username: e.target.value});
  }

  _handlePasswordChange(e) {
      this.setState({password: e.target.value});
  }

  _handleSubmit(e) {
    e.preventDefault();
    fetch('/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
    .then((response) => {
      if (!response.ok) {
        console.log("error logging in");
        return;
      }

      // Examine the text in the response
      response.json().then((data) => {
        this.setState({ token: data.token });
        this.props.onTokenChange(data.token);
      });
    })
    .catch((err) => {
      console.log("error logging in");
    })
  }

  render() {
    return (
      <div>
        <a className="nav-link" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {this.state.token ? 'Logged in' : 'Login'}
        </a>
        <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input 
                type        = "username"
                value       = {this.state.username}
                onChange    = {::this._handleUserChange}
                className   = "form-control"
                placeholder = "Username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
                <input 
                  type        = "password"
                  value       = {this.state.password}
                  onChange    = {::this._handlePasswordChange}
                  className   = "form-control"
                  placeholder = "Password"
                />
            </div>
            <button type="submit" onClick={this.onSubmit} className="btn btn-default">Submit</button>
          </form>
        </div>
      </div>
    )
  }
}
