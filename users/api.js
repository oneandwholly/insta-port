'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const User = require('./model');
const Photo = require('../photos/model');
const Follow = require('../follows/model');
const jwt = require('jwt-simple');
const config = require('../config');

const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.get('JWT_SECRET'));
}

const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/users/self
 *
 * Get information about the owner of the access token.
 */

router.get('/self', requireAuth, (req, res, next) => {
  let self = req.user;
  delete self.password;
  self.counts = { photo: null, follows: null, followed_by: null };
  // get media, follows, followed_by counts
  Photo.getCountByUserId(self.id, (err, count) => {
    if (err) {
      next(err);
      return;
    }
    self.counts.photo = count.photo_count;

    Follow.getBothCountsByUserId(self.id, (err, counts) => {
      if (err) {
        next(err);
        return;
      }

      self.counts.follows = counts.follows_count;
      self.counts.followed_by = counts.followed_by_count;
  
      res.json(self);
    })
  })
})

/**
 * GET /api/users/:id
 *
 * Retrieve a user.
 */
router.get('/:user', requireAuth, (req, res, next) => {
    User.read(req.params.user, (err, user) => {
      if (err) {
        next(err);
        return;
      }

      delete user.password;

      user.counts = { photo: null, follows: null, followed_by: null };
      // get media, follows, followed_by counts
      Photo.getCountByUserId(user.id, (err, count) => {
        if (err) {
          next(err);
          return;
        }
        user.counts.photo = count.photo_count;
    
        Follow.getBothCountsByUserId(user.id, (err, counts) => {
          if (err) {
            next(err);
            return;
          }
    
          user.counts.follows = counts.follows_count;
          user.counts.followed_by = counts.followed_by_count;
      
          res.json(user);
        })
      })
    });
  });

/**
 * Errors on "/api/users/*" routes.
 */
router.use((err, req, res, next) => {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    err.response = {
      message: err.message,
      internalCode: err.code
    };
    next(err);
  });
  
  module.exports = router;