import React from 'react';
import CustomPropTypes from '../../../../Utils/CustomPropTypes.js';
import { Validator } from 'jsonschema';

export default class JourneyImport extends React.Component {

  static propTypes = {
    handleJourneysSubmit: React.PropTypes.func.isRequired,
    journeys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney)
  }

  constructor(props) {
    super(props);

    this.state = {
      showView: false
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

    const reader = new FileReader(); 

    reader.onloadend = () => {
      const journeys = this._toJourneys(reader.result);
      this.props.handleJourneysSubmit(journeys);
    }

    reader.readAsText(file);
  }

  _toggleView(e) {
    e.preventDefault(); 

    this.setState({
      showView: !this.state.showView
    })

  }

  _handleExportClick() {
    const journeys = this.props.journeys;
    const data = JSON.stringify(journeys);

    const url = 'data:application/json;charset=utf-8,'+ encodeURIComponent(data);

    let exportFileDefaultName = 'journeys.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('target', '_blank');
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }


  render() {
    return (
      <div id="journeys-import">
        <button className="btn btn-secondary" onClick={::this._toggleView}>Import/Export Journeys</button>
        { this.state.showView && 
          <div>
            <form>
              <div className="form-group">
                <label htmlFor="inputFile">Journey import</label>
                <input id="inputFile" className="form-control input-sm" type="file" accept="application/json" onChange={(e) => this._handleFileChange(e)}/>
              </div>
            </form>
            <button className="btn btn-sm btn-info" onClick={() => this._handleExportClick()}>Export</button>
          </div>
        }
      </div>
    )
  }
}
