import React from 'react';
import ReactDOM from 'react-dom';
import App from './dev/components/App';

window.onload = () => {
  ReactDOM.render(<App/>, document.getElementById('main'));
};
