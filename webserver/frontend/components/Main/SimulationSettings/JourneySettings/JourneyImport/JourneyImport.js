import React from 'react';

export default class JourneyImport extends React.Component {

  static propTypes = {
    handleJourneysSubmit: React.PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      file: null
    }
  }

  _toJourneys(json) {
    const journeys = JSON.parse(json);
    this.props.handleJourneysSubmit(journeys);
  }

  _handleFileChange(e) {
    const file = e.target.files[0];

    if (!file || file.type !== "application/json") {
      this.setState({
        file: null
      });

      console.error("Inputted file is not a JSON");
      return
    }

    this.setState({
      file: e.target.files[0]
    })
  }

  _handleFileSubmit(e) {
    e.preventDefault();

    const file = this.state.file;
    const reader = new FileReader(); 

    reader.onloadend = () => {
      this._toJourneys(reader.result);
    }

    reader.readAsText(file);
  }

  render() {
    return (
      <form>
        <input type="file" accept="application/json" onChange={(e) => this._handleFileChange(e)}/>
        <button type="submit" onClick={(e) => this._handleFileSubmit(e)}> Import Journeys </button>
      </form>
    )
  }
}
