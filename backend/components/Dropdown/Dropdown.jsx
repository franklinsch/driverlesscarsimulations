import React, { PropTypes } from 'react';

export default class Dropdown extends React.Component {
  static propTypes = {
    items: React.PropTypes.array,
    onSelect: React.PropTypes.func
  }

  _onSelect(itemIndex) {
    let item = this.props.items[itemIndex].value;
    return this.props.onSelect(item);
  }

  render() {
    let items = [];
    for (let i = 0; i < this.props.items.length; i++) {
      items.push(<option value={i}>{item.label}</option>);
    }

    return <option onSelect={this._onSelect}>
      {items}
    </option>
  }
}