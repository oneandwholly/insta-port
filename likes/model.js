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

function create (user_id, photo_id, cb) {
  connection.query(`INSERT INTO likes (user_id, photo_id) VALUES (${user_id}, ${photo_id})`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, results);
  })
}

function read (user_id, photo_id, cb) {
  connection.query(`SELECT * FROM likes WHERE user_id=${user_id} AND photo_id=${photo_id}`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, results[0]);
  })
}

function _delete (user_id, photo_id, cb) {
  connection.query(`DELETE FROM likes WHERE user_id=${user_id} AND photo_id=${photo_id}`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, results);
  })
}

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
    read,
    create,
    delete: _delete,
    getCountByPhotoId
  };