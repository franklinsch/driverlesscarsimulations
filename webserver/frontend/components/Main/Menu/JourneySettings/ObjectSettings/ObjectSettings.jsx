import React from 'react';
import CustomPropTypes from '../../../../Utils/CustomPropTypes.jsx';

export default class ObjectSettings extends React.Component {

  static propTypes = {
    objects: React.PropTypes.arrayOf(CustomPropTypes.typeInfo),
    objectKindInfo: React.PropTypes.arrayOf(CustomPropTypes.kindInfo),
    handlers: React.PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      showSettings: false,
      showAddObject: false,
      objects: []
    }
  }

  _toggleShow() {
    this.setState({
      showSettings: !this.state.showSettings
    })
  }

  _toggleShowAdd() {
    this.setState({
      showAddObject: !this.state.showAddObject
    })
  }

  _handleFormSave() {
    const typeInfo = {
      name: this.state.typeName,
      kindName: this.state.kind || this.props.objectKindInfo[0].name,
      parameters: this.state.settings
    }

    this.props.handlers.handleSave(typeInfo);

    this._handleformHide();
  }

  _handleformHide() {
    let firstKind = null;
    if (this.props && this.props.objectKindInfo) {
      firstKind = this.props.objectKindInfo[0].name;
    }

    this.setState({
      showAddObject: false,
      typeName: null,
      settings: null,
      kind: firstKind
    })
  }

  componentDidMount() {
    $('select').material_select();
  }

  componentDidUpdate() {
    $('select').material_select();
  }

  _renderKindDropdown() {
    const settings = this.props.objectKindInfo || [];

    return (
      <select onChange={(e) => {
        const kindName = e.target.value;

        this.setState({
          kind: kindName,
          settings: null
        }, () => {
          const parameters = this._paramsForKindName(kindName);

          for (const parameter of parameters) {
            if (parameter.kind === "predefined") {
              this._updateSetting(parameter.name, parameter.allowedValues[0]);
            }
          }
        })
      }}>
        <option value="" disabled selected>Kind</option>
        {
          settings.map((setting, index) => {
            const name = setting.name;
            return <option value={name} key={index}>{name}</option>
          })
        }
      </select>
    )
  }

  _paramsForKindName(kindName) {
    for (const setting of this.props.objectKindInfo) {
      if (setting.name === kindName) {
        return setting.parameters;
      }
    }
  }

  _updateSetting(name, value) {
    this.setState({
      settings: {
        ...this.state.settings,
        [name]: value
      }
    })
  }

  _renderTypeNameInput() {
    const typeName = this.state.typeName || '';

    return (
      <div className="input-field">
        <label htmlFor="typeName">Type name</label>
        <input id="typeName" className="form-control" onChange={(e)=>{this.setState({typeName: e.target.value})}}/>
      </div>
    )
  }

  _renderSettings() {
    const kind = this.state.kind || this.props.objectKindInfo[0].name;
    const parameters = this._paramsForKindName(kind) || [];

    return (
      <div>
        {
          parameters.map((parameter, index) => {
            const name = parameter.name;
            const kind = parameter.kind;

            if (kind === "predefined") {
              const allowedValues = parameter.allowedValues;

              const onChange = (e) => {
                const value = e.target.value;
                this._updateSetting(name, value);
              }

              return (
                <div className="input-field" key={index}>
                  <label htmlFor={name}> {name} </label>
                  <select onChange={onChange}>
                    {
                      allowedValues.map((value, index1) => {
                        return <option id={name} key={index1} value={value} className="form-control">{value}</option>
                      })
                    }
                  </select>
                </div>
              )
            } else if (kind === "text") {
              const onChange = (e) => {
                this._updateSetting(name, e.target.value);
              }

              let value = "";

              if (this.state.settings && this.state.settings[name]) {
                value = this.state.settings[name];
              }

              return (
                <div className="input-field" key={index}>
                  <label htmlFor={name}> {name} </label>
                  <input id={name} value={value} onChange={onChange} className="form-control"/>
                </div>
              )
            }
          })
        }
      </div>
    )
  }

  render() {
    const objects = this.props.objects || [];

    return (
      <div id="object-settings">
        <button className="btn waves-effect waves-light" onClick={::this._toggleShow}>Show Objects</button>
        {
          this.state.showSettings &&
          <div>
            <ul className="collection">
              {
                objects.map((object, index) => {
                  const parameters = object.parameters || [];
                  const title = object.kindName + ":\n" + Object.keys(parameters).map((key) => {
                      if (parameters.hasOwnProperty(key)) {
                        return key + ": " + parameters[key];
                      }

                      return "";
                    }).join("\n");

                  return <li className="collection-item" title={title} key={index}> {object.name} </li>
                })
              }
            </ul>
            <button type='button' className="btn waves-effect waves-light" onClick={::this._toggleShowAdd}>Add Object Type</button>

            <div>
              { this.state.showAddObject &&
              <form>
              {this._renderTypeNameInput()}
                <div className="input-field">
                {this._renderKindDropdown()}
                </div>
              {this._renderSettings()}
                <button className='btn btn-default' onClick={::this._handleformHide}>
                  Cancel
                </button>
                <button className='btn btn-primary' onClick={::this._handleFormSave}>
                Save
                </button>
              </form>
              }
            </div>
          </div>
        }
      </div>
    )
  }
}
