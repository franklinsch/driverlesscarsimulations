const express = require('express');
const router = express.Router();
const async = require('async');
const path = require('path');
const jwt = require('express-jwt');
const config = require('../config');
const Simulation = require('../models/Simulation');
const Journey = require('../models/Journey');
const User = require('../models/User');

const auth = jwt({
  secret: config.token_secret,
  userProperty: 'payload'
});

// Catch unauthorised errors
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({
      "message": err.name + ": " + err.message
    });
  }
});

router.get('/profile', auth, ctrlProfile.profileRead);


router.get('/simulations/:simulationid', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
})

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
          console.log("Saved: " + savedJourney);
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
          console.log(result);
          res.send(result);
        })
        .catch((err) => {
          res.send(err);
        });
    });
  });

router.route('/user')
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = new User({
      username: username,
      password: password,
      admin: false,
      created_at: Date.now(),
      simulations: []
    });
    user.save()
      .then((user) => {
        res.sendStatus(200);
        res.send(user._id);
      })
      .catch((err) => {
        console.log("User save unsuccessful");
        res.sendStatus(400);
      });
  });

router.route('/login')
  .get((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({
      username: username
    }, (err, user) => {
      if (err) {
        res.sendStatus(400);
      }

    });
  });


router.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

module.exports = router;
