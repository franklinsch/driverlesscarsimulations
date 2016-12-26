import React, { PropTypes } from 'react';
import UtilFunctions from '../../../Utils/UtilFunctions.jsx';

export default class Dropdown extends React.Component {
  static propTypes = {
    enabled: React.PropTypes.bool,
    items: React.PropTypes.array,
    handlers: React.PropTypes.object
  }

  _onSelect(e) {
    console.log(e.target.name)
    let item = this.props.items[e.target.name];
    console.log(this.props.items)
    return this.props.handlers.handleSelect(item);
  }

  componentDidMount() {
    $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: true, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: false, // Displays dropdown below the button
        alignment: 'left' // Displays dropdown with edge aligned to the left of button
      }
    );
  }

  componentDidUpdate() {
    $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: true, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: false, // Displays dropdown below the button
        alignment: 'left' // Displays dropdown with edge aligned to the left of button
      }
    );
  }

  render() {
    let items = [];
    for (let i = 0; i < this.props.items.length; i++) {
      //TODO: Not a generalised Dropdown. Either specific further, or generalise
      items.push(<li key={i}><a href="#!" name={i} onClick={::this._onSelect}> {this.props.items[i].name}</a></li>);
    }
    //TODO: Replace with map below
    return (
      <div>
        <a className='dropdown-button btn' href='#' data-activates='dropdown1'>Select city</a>
        <ul id='dropdown1' className='dropdown-content'>
          {items}
        </ul>
      </div>
    );
  }
}
