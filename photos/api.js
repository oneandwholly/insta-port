'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const images = require('../lib/images');

const Photo = require('./model');

const router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

/**
 * POST /api/photos
 *
 * Create a new photo.
 */
// [START]
router.post(
    '/',
    images.multer.single('file'),
    images.sendUploadToGCS,
    (req, res, next) => {
      let data = req.body;
  
      // Was an image uploaded? If so, we'll use its public URL
      // in cloud storage.
      if (req.file && req.file.cloudStoragePublicUrl) {
        data.img_url = req.file.cloudStoragePublicUrl;
      }
      console.log('this is data', data);
  
      // Save the data to the database.
      Photo.create(data, (err, savedData) => {
        if (err) {
          next(err);
          return;
        }
        res.json(savedData);
      });
    }
  );
  // [END]

/**
 * GET /api/photos
 * 
 * query: username
 *
 * Fetch an array of photos by username (up to ten at a time).
 */
router.get('/', (req, res, next) => {
  Photo.list(2, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.json({
      photos: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * Errors on "/api/photos/*" routes.
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