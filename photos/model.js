'use strict';

const extend = require('lodash').assign;
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

// function list (limit, token, cb) {
//   token = token ? parseInt(token, 10) : 0;
//   connection.query(
//     'SELECT * FROM `books` LIMIT ? OFFSET ?', [limit, token],
//     (err, results) => {
//       if (err) {
//         cb(err);
//         return;
//       }
//       const hasMore = results.length === limit ? token + results.length : false;
//       cb(null, results, hasMore);
//     }
//   );
// }

function create (data, cb) {
  connection.query('INSERT INTO `photos` SET ?', data, (err, res) => {
    if (err) {
      cb(err);
      return;
    }
    read(res.insertId, cb);
  });
}

function read (id, cb) {
  connection.query(
    'SELECT * FROM `photos` WHERE `id` = ?', id, (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found'
        };
      }
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    });
}

function update (id, data, cb) {
  connection.query(
    'UPDATE `photos` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      read(id, cb);
    });
}

function _delete (id, cb) {
  connection.query('DELETE FROM `photos` WHERE `id` = ?', id, cb);
}

module.exports = {
  //list: list,
  create: create,
  read: read,
  update: update,
  delete: _delete
};