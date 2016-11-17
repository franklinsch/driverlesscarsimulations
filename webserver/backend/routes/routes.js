const express = require('express');
const router = express.Router();
const async = require('async');
const path = require('path');
const jwt = require('express-jwt');
const passport = require('passport');
const Simulation = require('../models/Simulation');
const Journey = require('../models/Journey');
const User = require('../models/User');


router.get('/simulations/:simulationid', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
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
    async.each(journeys, (journey, callback) => {
      const newJourney = new Journey(journey);
      newJourney.save()
        .then((savedJourney) => {
          savedJourneys.push(savedJourney);
          callback(null);
        })
        .catch((err) => {
          callback(err);
        });
    }, (err) => {
      const updateInfo = {
        $push: {
          journeys: {
            $each: savedJourneys
          }
        }
      };
      const options = {
        upsert: true,
        returnNewDocument: true
      };
      Simulation.findOneAndUpdate({
        _id: id
      }, updateInfo, options)
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          res.send(err);
        });
    });
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
      const token = user.generateJwt();
      res.status(200);
      res.json({
        "token": token
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
        res.json({
          "token": token
        });
      } else {
        // If user is not found
        res.status(401).json(info);
      }
    })(req, res);
  });


router.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

module.exports = router;
