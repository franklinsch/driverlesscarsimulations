const mongoose = require('mongoose');
const User = require('./User');
const Kind = require('./Kind');
const Validator = require('jsonschema').Validator;

const validator = new Validator();

const typeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  kind: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kind'
  },
  library: {
    type: Boolean,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  properties: {
    type: Object,
    required: true,
    validate: {
      validator: function(v, callback) {
        return Kind.populate(this, { path: 'kind', model: 'Kind' }, function(err, type) {
          if (err) {
            console.log(err);
            return false;
          }
          const result = validator.validate(v, type.kind.json_schema);
          callback(result.errors.length === 0);
        });
      },
      message: "{VALUE} does not match it's kind."
    }
  }
});

module.exports = mongoose.model('Type', typeSchema);
