import React from 'react';
import CustomPropTypes from '../../../../Utils/CustomPropTypes.js';
import { Validator } from 'jsonschema';

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

    const validator = new Validator();

    var schema = {
      type: CustomPropTypes._journey
    }

    for (const journey of journeys) {
      const validatorResult = validator.validate(journey, schema);
      if (validatorResult.errors.length !== 0) {
        console.error("Input JSON is invalid");
        return
      }
    }

    return journeys;
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
      const journeys = this._toJourneys(reader.result);
      this.props.handleJourneysSubmit(journeys);
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
