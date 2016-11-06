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

    this.state = {
      showSettings: false,
      showAddObject: false,
      kind: '',
      avgSpeed: '',
      topSpeed: '',
      length: '',
      weight: ''
    }
  }

  static objectKinds = ["vehicule", "pedestrian"];

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

  _handleKindSelect(e) {
    const kind = e.target.value;

    this.setState({
      kind: kind
    })
  }

  _renderSelectKind() {
    return (
      <select onChange={::this._handleKindSelect}>
        {
          ObjectSettings.objectKinds.map((kind, index) => {
            return <option value={kind} key={index}>{kind}</option>
          })
        }
      </select>
    )
  }

  _handleFormSave() {
    const objectSettings = {
      kind: this.state.kind,
      avgSpeed: this.state.avgSpeed, 
      topSpeed: this.state.topSpeed,
      length: this.state.length,
      weight: this.state.weight
    }

    this.props.handleSave(objectSettings);

    this._handleModalHide()
  }

  _handleModalHide() {
    this.setState({
      showAddObject: false
    })
  }

  render() {
    return (
      <div id="object-settings">
        <button className="btn btn-primary" onClick={::this._toggleShow}>Show</button>
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
                  <div className="form-group">
                    <label htmlFor="kind">Kind</label>
                    {this._renderSelectKind()}
                  </div>

                  <div className="form-group">
                    <label htmlFor="avgSpeed"> Average Speed </label>
                    <input id="avgSpeed" className="form-control" value={this.state.avgSpeed} onChange={(e) => this.setState({avgSpeed: e.target.value})}/>
                  </div>

                  <div className="form-group">
                    <label htmlFor="topSpeed"> Top Speed </label>
                    <input id="topSpeed" className="form-control" value={this.state.topSpeed} onChange={(e) => this.setState({topSpeed: e.target.value})}/>
                  </div>

                  <div className="form-group">
                    <label htmlFor="length"> Length </label>
                    <input id="length" className="form-control" value={this.state.length} onChange={(e) => this.setState({length: e.target.value})}/>
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight"> Weight </label>
                    <input id="weight" className="form-control" value={this.state.weight} onChange={(e) => this.setState({weight: e.target.value})}/>
                  </div>

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
