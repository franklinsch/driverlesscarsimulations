import React, { PropTypes } from 'react';
import UtilFunctions from '../../../Utils/UtilFunctions';

export default class Dropdown extends React.Component {
  static propTypes = {
    items: React.PropTypes.array,
    onSelect: React.PropTypes.func
  }

  _onSelect(event) {
    let item = this.props.items[event.target.value].value;
    return this.props.onSelect(item);
  }

  render() {
    let items = [];
    for (let i = 0; i < this.props.items.length; i++) {
      items.push(<option key={i} value={i}>{this.props.items[i].name}</option>);
    }

    return <select onChange={(event) => this._onSelect(event)}>
      {items}
    </select>
  }
}
