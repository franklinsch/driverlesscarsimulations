import React from 'react';
import ReactDOM from 'react-dom';


class App extends React.Component {
  render() {
    return <div> Hello </div>;
  }
}

window.onload = () => {
  ReactDOM.render(<App/>, document.getElementById('main'));
};
