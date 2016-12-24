import React, { PropTypes } from 'react';
import UtilFunctions from '../../../Utils/UtilFunctions.jsx';

export default class Dropdown extends React.Component {
  static propTypes = {
    enabled: React.PropTypes.bool,
    items: React.PropTypes.array,
    handlers: React.PropTypes.object
  }

  _onSelect(e) {
    let item = this.props.items[e.target.value];
    return this.props.handlers.handleSelect(item);
  }

  componentDidMount() {
    $('select').material_select();
  }

  componentDidUpdate() {
    $('select').material_select();
  }

  render() {
    let items = [];
    for (let i = 0; i < this.props.items.length; i++) {
      //TODO: Not a generalised Dropdown. Either specific further, or generalise
      items.push(<option key={i} value={i}>{this.props.items[i].name}</option>);
    }
    //TODO: Replace with map below
    return (
			<div className="input-field">
        <select disabled={!this.props.enabled}
          onChange={::this._onSelect}
        >
          {items}
        </select>
			</div>
		);
  }
}
