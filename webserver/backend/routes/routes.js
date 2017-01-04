const express = require('express');
const router = express.Router();
const async = require('async');
const path = require('path');
const passport = require('passport');
const Simulation = require('../models/Simulation');
const FilteredSimulation = require('../models/FilteredSimulation');
const Journey = require('../models/Journey');
const User = require('../models/User');
const config = require('../config');
const auth = require('../authenticate');
const fs = require('fs');

const server = require('../../server.js');

router.route('/simulations')
  .get(auth, (req, res) => {
    const userId = res._headers.token._id;
    User.findOne({
        _id: userId
      })
      .then((result) => {
        res.json({
          userID: result._id,
          username: result.username,
          simulations: result.simulations
        });
      })
      .catch((err) => {
        res.send(err);
      });
  })
  .post(auth, (req, res) => {
    const userID = res._headers.token._id;
    const simulationID = req.body.simulationID;
    const updateInfo = {
      $push: {
        simulations: simulationID
      }
    };
    const options = {
      upsert: true,
      returnNewDocument: true
    };
    User.findOneAndUpdate({
        _id: userID
      }, updateInfo, options)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(err);
      });
  })

router.get('/simulations/:simulationID', auth, (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

router.route('/simulations/active')
  .post((req, res) => {
    passport.authenticate('local', (err, user, info) => {

      // If Passport throws/catches an error
      if (err) {
        res.status(404).json(err);
        return;
      }

      // Credentials are valid
      if (user) {
        res.status(200);
        res.json({
          "active_simulation": user.active_simulation
        });
      } else {
        res.status(404).json(info);
        return;
      }
    })(req, res);
  });

router.route('/simulations/activate')
  .post(auth, (req, res) => {
    const userID = res._headers.token._id;
    const simulationID = req.body.simulationID;
    const updateInfo = {
      active_simulation: simulationID
    };
    const options = {
      upsert: true,
      returnNewDocument: true
    };
    User.findOneAndUpdate({
        _id: userID
      }, updateInfo, options)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(err);
      });
  })

router.route('/simulations/:simulationID/download')
  .get((req, res) => {
    Simulation.findOne({
        _id: req.params.simulationID
      })
      .then((simulation) => {
        const filteredSimulation = new FilteredSimulation(simulation);
        const simulationJSON = filteredSimulation.get();

        if (req.query.json) {
          // Print JSON
          res.json(simulationJSON);
        } else {
          const filename = 'simulation_'+simulation._id+'.json';

          // Download JSON
          res.set('Content-Type', 'application/json');
          res.set('Content-disposition', 'attachment; filename='+filename);

          res.send(simulationJSON);
        }
      })
      .catch((err) => {
        res.send(err);
      });
  });

router.route('/simulations/:simulationID/journeys')
  .get((req, res) => {
    Simulation.findOne({
        _id: req.params.simulationID
      })
      .then((result) => {
        res.json(result.journeys);
      })
      .catch((err) => {
        res.send(err);
      });
  })
  .post((req, res) => {
    const id = req.params.simulationID;
    const journeys = req.body;
    savedJourneys = [];
    server._handleRequestEventUpdate({
      simulationID: id,
      journeys: journeys
    }, null, (error, simulation) => {
      if (error || !simulation) {
        res.send(error);
      } else {
        res.send(simulation);
      }
    })
  });

router.route('/register')
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = new User({
      username: username,
      admin: false,
      created_at: Date.now(),
      simulations: []
    });
    user.setPassword(password);

    user.save((err) => {
      if (err) {
        res.status(404).json(err);
        return;
      }
      const token = user.generateJwt();
      res.status(200);
      res.setHeader('token', token);
      res.json({
        "token": token,
        "userID": user._id,
        "username": user.username
      });
    });
  });

router.route('/login')
  .post((req, res) => {
    passport.authenticate('local', (err, user, info) => {

      // If Passport throws/catches an error
      if (err) {
        res.status(404).json(err);
        return;
      }

      // If a user is found
      if (user) {
        const token = user.generateJwt();
        res.status(200);
        res.setHeader('token', token);
        res.json({
          "token": token,
          "userID": user._id,
          "username": user.username
        });
      } else {
        // If user is not found
        res.status(401).json(info);
      }
    })(req, res);
  });

router.route('/uploads')
  .post((req, res) => {
    fs.writeFile('../uploads/hotspots.json', JSON.stringify(req.body, null, 2), function(err) {
      if (err) {
        console.log(err);
      }
      res.status(200).send('success');
    });
  });

router.route('/framework_api')
  .post((req, res) => {
    User.findOne({ api_id: req.body.api_id }, (err, user) => {
      if (err) {
        console.log(err);
        res.status(500).send('Internal error');
        return;
      }
      if (!user) {
        res.status(404).send('User not found');
        return;
      }

      let hash = user.getAPIKeyHash(req.body.api_key);
      user.api_keys.findOne({ hash: hash }, (err, api_key) => {
        if (err) {
          res.status(500).send('Internal error');
          return;
        }
        if (!api_key) {
          res.status(401).send('API key not valid');
          return;
        }

        const simID = req.body.simulationID;
        const ip = req.ip;
        authentication_token = user.generateAPIToken(simID, ip);
        res.status(200).json({
          'simulationID': api_key.simulationID,
          'token': authentication_token
        });
      });
    });
  });

router.route('/api_keys/list')
  .get(auth, (req, res) => {
    const userId = res._headers.token._id;
    User.findOne({
        _id: userId
      })
      .then((user) => {
        res.json({
          'api_keys': user.api_keys
        });
      })
      .catch((err) => {
        res.send(err);
      });
  });



router.route('/api_keys/add')
  .post(auth, (req, res) => {
    User.findOne({
        _id: userId
      })
      .then((user) => {
        const title = req.body.title;
        if (!title) {
          res.status(400).send('Title is missing');
          return;
        }

        const simulationID = req.body.simulationID;
        if (!req.body.simulationID) {
          res.status(400).send('Simulation ID is missing');
          return;
        }

        // TODO: verify that simulation id actually exists

        const key = uuidV4();
        let hash = user.getAPIKeyHash(key);

        // Create new API key
        const apiKey = new APIKey({
            title: title,
            hash: hash,
            simulationID: simulationID
        });

        const userID = res._headers.token._id;
        const updateInfo = {
          $push: {
            api_keys: apiKey
          }
        };
        const options = {
          returnNewDocument: true
        };
        User.findOneAndUpdate({
            _id: userID
          }, updateInfo, options)
          .then((result) => {
            res.send({
              id: apiKey._id,
              title: title,
              simulationID: simulationID,
              apiKey: key
            });
          })
          .catch((err) => {
            res.send(err);
          });
      });
  });

router.get('*', auth, (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

module.exports = router;
