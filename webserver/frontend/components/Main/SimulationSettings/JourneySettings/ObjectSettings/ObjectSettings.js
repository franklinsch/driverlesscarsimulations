import React from 'react';
import Modal from 'react-bootstrap-modal';
import CustomPropTypes from '../../../../Utils/CustomPropTypes.js';

export default class ObjectSettings extends React.Component {

  static propTypes = {
    handleSave: React.PropTypes.func.isRequired,
    objects: React.PropTypes.arrayOf(CustomPropTypes.typeInfo),
    objectKindInfo: React.PropTypes.arrayOf(CustomPropTypes.kindInfo)
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

    this.props.handleSave(typeInfo);

    this._handleModalHide();
  }

  _handleModalHide() {
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
      <div className="form-group">
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
                <div className="form-group" key={index}>
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
                <div className="form-group" key={index}>
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
        <button className="btn btn-secondary" onClick={::this._toggleShow}>Show Objects</button>
        {
          this.state.showSettings &&
            <div>
              <ul>
                {
                  objects.map((object, index) => {
                    const parameters = object.parameters || [];
                    const title = object.kindName + ":\n" + Object.keys(parameters).map((key) => {
                      if (parameters.hasOwnProperty(key)) {
                        return key + ": " + parameters[key];
                      }

                      return "";
                    }).join("\n");

                    return <li title={title} key={index}> {object.name} </li>
                  })
                }
              </ul>
              <button type='button' className="btn" onClick={::this._toggleShowAdd}>Add Object Type</button>

              <Modal
                show={this.state.showAddObject}
                onHide={::this._handleModalHide}
                aria-labelledby="ModalHeader"
              >
                <Modal.Header closeButton>
                  <Modal.Title id='ModalHeader'>Add Object Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {this._renderTypeNameInput()}
                  <div className="form-group">
                    <label htmlFor="kind">Kind</label>
                    {this._renderKindDropdown()}
                  </div>

                  {this._renderSettings()}

                </Modal.Body>
                <Modal.Footer>
                  <Modal.Dismiss className='btn btn-default'>Cancel</Modal.Dismiss>

                  <button className='btn btn-primary' onClick={::this._handleFormSave}>
                    Save
                  </button>
                </Modal.Footer>
              </Modal>
            </div>
        }
      </div>
    )
  }
}
