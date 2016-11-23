import React from 'react';
import cookie from 'react-cookie';
import UtilFunctions from '../../../Utils/UtilFunctions.jsx';
import 'whatwg-fetch';

export default class LoginButton extends React.Component {

  static propTypes = {
    token: React.PropTypes.string,
    activeUser: React.PropTypes.string,
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

  _handleFormSubmit(e) {
    e.preventDefault();
    const action = e.target.value;
    if (action === 'logout') {
      cookie.remove('token', { path: '/' });
      window.sessionStorage.removeItem('token');
      this.setState({ token: '' });
      this.props.handlers.handleTokenChange('', '');
      return;
    }
    const url = "/" + action;
    fetch(url, {
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
      this.setState({ password: '' });
      if (!response.ok) {
        console.log("error logging in");
        return;
      }

      // Examine the text in the response
      response.json().then((data) => {
        // save token in the cookie for 10 minutes
        cookie.save('token', data.token, {
          path: '/',
          maxAge: UtilFunctions.session_length,
        });
        window.sessionStorage.setItem('token', data.token);
        this.setState({
          token: data.token,
          loggedInUsername: data.username
         });
        this.props.handlers.handleTokenChange(data.token, data.userID, data.username);
      });
    })
    .catch((err) => {
      console.log("error logging in");
    })
  }

  render() {
    return (
      <div>
        <a className="nav-link" href="#" id="LoginDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {
            this.state.token ?
            'Hello ' + this.props.activeUser + '!'
            :
            'Login'
          }
        </a>
        <div id="auth-dropdown" className="dropdown-menu" aria-labelledby="LoginDropdown">
          <form>
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
            <button
              type="submit"
              value=
              {
                this.state.token ?
                'logout'
                :
                'login'
              }
              onClick={::this._handleFormSubmit}
              className="btn btn-default">
              {
                this.state.token ?
                'Log Out'
                :
                'Log In'}
            </button>
            <button
              type="submit"
              value="register"
              onClick={::this._handleFormSubmit}
              className="btn btn-default">
              Register
            </button>
          </form>
        </div>
      </div>
    )
  }
}
