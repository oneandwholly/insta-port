'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const User = require('./model');
const jwt = require('jwt-simple');
const config = require('../config');

const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.get('JWT_SECRET'));
}

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/users/:id
 *
 * Retrieve a user.
 */
router.get('/:user', (req, res, next) => {
    User.read(req.params.user, (err, entity) => {
      if (err) {
        next(err);
        return;
      }
      res.json(entity);
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