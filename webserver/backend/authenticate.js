const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const config = require('./config');


module.exports = (req, res, next) => {

  const cookies = cookie.parse(req.headers.cookie || '');


  // check header or url parameters or post parameters for token
  const token = cookies.token || req.body.token || req.query.token || req.headers['token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.token_secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        // if everything is good, save to request for use in other routes
        res.setHeader('token', decoded);
        User
          .findById(decoded._id)
          .exec(function(err, user) {
            res.user = user;
          });
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });

  }

};
