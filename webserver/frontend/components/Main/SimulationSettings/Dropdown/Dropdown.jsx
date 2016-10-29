import React, { PropTypes } from 'react';
import UtilFunctions from '../../../Utils/UtilFunctions';

export default class Dropdown extends React.Component {
  static propTypes = {
    items: React.PropTypes.array,
    onSelect: React.PropTypes.func
  }

  _onSelect(event) {
    let item = this.props.items[event.target.value];
		console.log("HellO");
    return this.props.onSelect(item);
  }

  render() {
    let items = [];
    for (let i = 0; i < this.props.items.length; i++) {
      items.push(<option key={i} value={i}>{this.props.items[i].name}</option>);
    }

    return (
			<div className="row">
				<div className="col-sm-4">
				</div>
				<div className="col-sm-4">
					<select className="form-control" onChange={(event) => this._onSelect(event)}>
						{items}
					</select>
				</div>
				<div className="col-sm-4">
				</div>
			</div>
		);
  }
}
