'use strict';

const mysql = require('mysql');
const config = require('../config');

const options = {
  user: config.get('MYSQL_USER'),
  password: config.get('MYSQL_PASSWORD'),
  database: 'instaclone'
};

if (config.get('INSTANCE_CONNECTION_NAME') && config.get('NODE_ENV') === 'production') {
  options.socketPath = `/cloudsql/${config.get('INSTANCE_CONNECTION_NAME')}`;
}

const connection = mysql.createConnection(options);

function getTagsByPhotoId (photo_id, cb) {
    connection.query(
        `SELECT tag_name FROM photos_tags INNER JOIN tags ON tag_id = id WHERE photo_id=${photo_id}`, (err, results) => {
          if (err) {
            cb(err);
            return;
          }
          cb(null, results);
        });
}

module.exports = {
    getTagsByPhotoId
  };