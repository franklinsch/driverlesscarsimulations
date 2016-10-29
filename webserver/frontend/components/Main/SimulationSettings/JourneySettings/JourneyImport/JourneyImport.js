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

  _toJourneys(csv) {
    const journeyTexts = csv.split(/\r?\n/);
    
    const journeys = journeyTexts.map((journeyText) => {
      const journeyArray = journeyText.split(",");

      return {
        origin: {
          lat: journeyArray[0],
          lng: journeyArray[1]
        }, 
        destination: {
          lat: journeyArray[2],
          lng: journeyArray[3]
        }
      }
    })

    this.props.handleJourneysSubmit(journeys);
  }

  _handleFileChange(e) {
    const file = e.target.files[0];

    if (!file || file.type !== "text/csv") {
      this.setState({
        file: null
      });

      console.error("Inputted file is not a CSV");
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
        <input type="file" accept="text/csv" onChange={(e) => this._handleFileChange(e)}/>
        <button type="submit" onClick={(e) => this._handleFileSubmit(e)}> Import Journeys </button>
      </form>
    )
  }
}
