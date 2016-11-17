import React from 'react';

export default class LoginButton extends React.Component {

  static propTypes = {
    handlers: React.PropTypes.object
  }

  _handleSubmit(e) {
   e.preventDefault();

   this.props.handlers.handleSubmit(e);
  }

  render() {
    return (
      <div>
        <a className="nav-link" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Login
        </a>
        <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
          <form>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="username" 
                onChange={this.onChange} 
                className="form-control" 
                placeholder="Username" 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password"
                onChange={this.onChange}
                className="form-control"
                placeholder="Password"
              />
            </div>
            <button type="submit" onClick={this.onSubmit} className="btn btn-default">Submit</button>
          </form>
        </div>
      </div>
    )
  }

}
