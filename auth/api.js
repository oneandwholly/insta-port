'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const User = require('../users/model');
const jwt = require('jwt-simple');
const config = require('../config');

const passportService = require('../services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.get('JWT_SECRET'));
}

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * POST /api/auth/signup
 *
 * Create a new user.
 */
router.post('/signup', (req, res, next) => {

    if (!req.body.username || !req.body.email || !req.body.password) {
        return res.status(422).send({ error: 'You must provide username, email and password'});
    }

    User.readByUsername(req.body.username, (err, existingUser) => {

        if (err) {
            if (err.message !== 'Not found') {
                next(err);
                return;
            }
        }
        
        // if username already exists,
        if (existingUser) {
            res.status(422).send({ error: "Username is in use"});
            return;
        }

        User.readByEmail(req.body.email, (err, existingUser) => {
            if (err) {
                if (err.message !== 'Not found') {
                    next(err);
                    return;
                }
            }
            
            // if email already exists,
            if (existingUser) {
                res.status(422).send({ error: "Email is in use"});
                return;
            }

            User.create(req.body, (err, entity) => {
                if (err) {
                    next(err);
                    return;
                }
                
                res.json({ token: tokenForUser(entity) });
                });
            });

        });
    });


/**
 * POST /api/auth/login
 *
 * Authenticate a user.
 */
router.post('/login', requireLogin, (req, res, next) => {

    res.send({ token: tokenForUser(req.user) });

    // getModel().create(req.body, (err, entity) => {
    //   if (err) {
    //     next(err);
    //     return;
    //   }
    //   res.json(entity);
    // });
  });

/**
 * POST /api/auth/login
 *
 * Authenticate a user.
 */
router.post('/login', requireLogin, (req, res, next) => {

    res.send({ token: tokenForUser(req.user) });

    // getModel().create(req.body, (err, entity) => {
    //   if (err) {
    //     next(err);
    //     return;
    //   }
    //   res.json(entity);
    // });
  });

/**
 * POST /api/auth/token
 *
 * Return a user that matches given token.
 */
router.get('/token', requireAuth, (req, res, next) => {
        delete req.user.password;
        res.json(req.user);
    });



/**
 * Errors on "/api/auth/*" routes.
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