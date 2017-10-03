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

function getCountByPhotoId (photo_id, cb) {
    connection.query(
        'SELECT COUNT(*) AS like_count FROM `likes` where `photo_id` = ?', 
        photo_id, 
        (err, results) => {
          if (err) {
            cb(err);
            return;
          }
          cb(null, results[0]);
        }
      )
}

module.exports = {
    getCountByPhotoId
  };