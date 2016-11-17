import React, { PropTypes } from 'react';
import UtilFunctions from '../../../Utils/UtilFunctions.jsx';

export default class Dropdown extends React.Component {
  static propTypes = {
    items: React.PropTypes.array,
    handlers: React.PropTypes.object
  }

  _onSelect(e) {
    let item = this.props.items[e.target.value];
    return this.props.handlers.handleSelect(item);
  }

  render() {
    let items = [];
    for (let i = 0; i < this.props.items.length; i++) {
      items.push(<option key={i} value={i}>{this.props.items[i].name}</option>); //TODO: Not a generalised Dropdown. Either specific further, or generalise
    }
    //TODO: Replace with map below

    return (
			<div className="row">
        <select 
          className="form-control"
          onChange={::this._onSelect}
        >
          {items} //TODO: Replace here
        </select>
			</div>
		);
  }
}
