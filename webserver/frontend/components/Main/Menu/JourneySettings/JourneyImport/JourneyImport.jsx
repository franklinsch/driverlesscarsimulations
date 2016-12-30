import React from 'react';
import CustomPropTypes from '../../../../Utils/CustomPropTypes.jsx';
import { Validator } from 'jsonschema';

export default class JourneyImport extends React.Component {

  static propTypes = {
    journeys: React.PropTypes.arrayOf(CustomPropTypes.simulationJourney),
    handlers: React.PropTypes.object
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
      type: CustomPropTypes._simulationJourney
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
      this.props.handlers.handleJourneysSubmit(journeys);
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
        <button className="btn waves-effect waves-light" onClick={::this._toggleView}>Import/Export Journeys</button>
        { this.state.showView && 
          <div>
            <form>
              <div className="file-field input-field">
                <div className="btn waves-effect waves-light">
                  <span>Import</span>
                  <input type="file" onChange={::this._handleFileChange}/>
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path validate" type="text"/>
                </div>
              </div>
            </form>
            <button className="btn waves-effect waves-light" onClick={::this._handleExportClick}>Export</button>
          </div>
        }
      </div>
    )
  }
}
