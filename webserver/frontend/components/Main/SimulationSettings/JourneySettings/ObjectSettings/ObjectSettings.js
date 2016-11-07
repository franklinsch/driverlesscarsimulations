import React from 'react';
import Modal from 'react-bootstrap-modal';
import CustomPropTypes from '../../../../Utils/CustomPropTypes.js';

export default class ObjectSettings extends React.Component {

  static propTypes = {
    handleSave: React.PropTypes.func.isRequired,
    settings: React.PropTypes.arrayOf(CustomPropTypes.simulationObjectKind)
  }

  constructor(props) {
    super(props);

    const firstKind = props.settings[0].name;

    this.state = {
      showSettings: false,
      showAddObject: false,
      kind: firstKind,
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
      kindInfo: {
        name: this.state.kind,
        parameters: this.state.settings
      }
    }

    this.setState({
      objects: this.state.objects.concat([typeInfo])
    })

    this.props.handleSave(typeInfo);

    this._handleModalHide()
  }

  _handleModalHide() {
    const firstKind = this.props.settings[0].name;

    this.setState({
      showAddObject: false,
      kind: firstKind
    })

  }

  _renderKindDropdown() {
    const settings = this.props.settings;

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
    for (const setting of this.props.settings) { 
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
    return (
      <div className="form-group">
        <label htmlFor="typeName">Type name</label>
        <input id="typeName" className="form-control" value={this.state.typeName || ''} onChange={(e)=>{this.setState({typeName: e.target.value})}}/>
      </div>
    )
  }

  _renderSettings() {
    const parameters = this._paramsForKindName(this.state.kind); 

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

              return (
                <div className="form-group" key={index}>
                  <label htmlFor={name}> {name} </label>
                  <input id={name} value={this.state[name]} onChange={onChange} className="form-control"/>
                </div>
              )
            }
          })
        }
      </div>
    )
  }

  render() {
    return (
      <div id="object-settings">
        <button className="btn btn-secondary" onClick={::this._toggleShow}>Show Objects</button>
        <ul>
          {
            this.state.objects.map((object, index) => {
              return <li key={index}> {object.name} </li>
            })
          }
        </ul>
				{
					this.state.showSettings &&
						<div>
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
