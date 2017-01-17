const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const server = require('../server.js');
const Simulation = require('../backend/models/Simulation');

chai.use(sinonChai);
const should = chai.should();

describe('Kinds and Types', function() {

  let connection;

  beforeEach(function() {
    connection = {
      send: sinon.spy()
    };
  });

  describe('#_handleRequestObjectKinds(connection)', function() {
    it('should send the default kinds', function() {
      server._handleRequestObjectKinds(connection);
      connection.send.should.have.been.calledWith(JSON.stringify({
        type: "object-kind-info",
        content: [{
          name: "Vehicle",
          parameters: [
          {
            name: "Average Speed",
            kind: "text"
          },
          {
            name: "Top Speed",
            kind: "text"
          },
          {
            name: "Weight",
            kind: "text"
          },
          {
            name: "Length",
            kind: "text"
          }
          ]
        },
        {
          name: "Creature",
          parameters: [
          {
            name: "Type",
            kind: "predefined",
            allowedValues: ["unicorn", "dog"]
          }
          ]
        },
        {
          name: "Road Hazard",
          parameters: [
          {
            name: "Type",
            kind: "predefined",
            allowedValues: ["Shattered glass", "Traffic cone", "Ghost driver"]
          },
          {
            name: "Slowdown factor",
            kind: "text"
          }
          ]
        }]
      }));
    });
  });

  describe('#_handleRequestDefaultObjectTypes(connection)', function() {
    it('should send default object types', function() {
      server._handleRequestDefaultObjectTypes(connection);
      connection.send.should.have.been.calledWith(JSON.stringify({
        type: "default-object-types",
        content: [{
          name: "Car",
          kindName: "vehicle",
          parameters: {
            "Average Speed": "50",
            "Top Speed": "120",
            "Length": "450",
            "Weight": "1355"
          }
        }]
      }));
    });
  });

});
