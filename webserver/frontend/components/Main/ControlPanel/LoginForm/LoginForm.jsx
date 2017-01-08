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
        response.json().then((data) => {
          if (data.message) {
            Materialize.toast(data.message, 3000);
          }
          if (data.code === 11000) {
            Materialize.toast('Username already taken', 3000);
          }
        });
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

  componentDidMount() {
    $('.modal').modal();
  }

  componentDidUpdate() {
    $('.modal').modal();
  }

  render() {
    return (
      <div>
          {   
            this.state.token ? 
            <form>
              <ul id="nav-mobile" className="right hide-on-med-and-down">
                <li>
                    Hello {this.props.activeUser}!
                  </li>
                  <li>
                    <button
                      type="submit"
                      value= 'logout'
                      onClick={::this._handleFormSubmit}
                      className="btn waves-effect waves-light">
                      Log Out
                    </button>
                  </li>
              </ul>
            </form>
            :
            <form>
             <ul id="nav-mobile" className="right hide-on-med-and-down">
              <li>
                <input
                  type="text"
                  value={this.state.username}
                  onChange={::this._handleUserChange}
                  className="validate"
                  placeholder="Username"
                />
              </li>
              <li>
                <input
                  type="password"
                  value={this.state.password}
                  onChange={::this._handlePasswordChange}
                  className="validate"
                  placeholder="Password"
                />
              </li>
              <li>
                <button
                  type="submit"
                  value= 'login'
                  onClick={::this._handleFormSubmit}
                  className="btn waves-effect waves-light">
                  Log In
                </button>
              </li>
              <li>
                <button
                  type="submit"
                  value="register"
                  onClick={::this._handleFormSubmit}
                    className="btn waves-effect waves-light">
                  Register
                </button> 
              </li>
          </ul>
          </form>
        }
      </div>
    )
  }
}
