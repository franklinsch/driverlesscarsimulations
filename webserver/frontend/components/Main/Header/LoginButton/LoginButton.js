import React from 'react';
import 'whatwg-fetch';

export default class LoginButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      token: this.props.token
    };

    this.handleUserChange = this.handleUserChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  handleUserChange(event) {
      this.setState({username: event.target.value});
    }
  handlePasswordChange(event) {
      this.setState({password: event.target.value});
    }

  handleFormSubmit(event) {
 event.preventDefault();
 const action = event.target.value;
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
      <div id="auth-dropdown" className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
        <form>
              <div className="form-group">
                <label>Username</label>
                <input type="username" value={this.state.username} onChange={this.handleUserChange} className="form-control" placeholder="Username" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={this.state.password} onChange={this.handlePasswordChange}  className="form-control" placeholder="Password" />
              </div>
              <button type="submit" value="login" onClick={this.handleFormSubmit} className="btn btn-default">Login</button>
              <button type="submit" value="register" onClick={this.handleFormSubmit} className="btn btn-default">Register</button>
            </form>
      </div>
      </div>
    )
  }

}
