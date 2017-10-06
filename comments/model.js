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
        'SELECT COUNT(*) AS comment_count FROM `comments` where `photo_id` = ?', 
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

function read (id, cb) {
  connection.query(`SELECT * FROM comments WHERE id=${id}`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, results[0]);
  })
}

function create (user_id, photo_id, text, cb) {
  connection.query(`INSERT INTO comments (user_id, photo_id, text) VALUES (${user_id}, ${photo_id}, '${text}')`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }
    read(results.insertId, cb)
  })
}

function list (photo_id, cb) {
  connection.query(`SELECT * FROM comments WHERE photo_id=${photo_id}`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, results);
  })
}

function _delete (id, cb) {
  connection.query(`DELETE FROM comments WHERE id=${id}`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, results);
  })
}

module.exports = {
  getCountByPhotoId,
  create,
  list,
  delete: _delete
  };