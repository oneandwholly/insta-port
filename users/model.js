'use strict';

const mysql = require('mysql');
const config = require('../config');
const bcrypt = require('bcrypt-nodejs');

const options = {
  user: config.get('MYSQL_USER'),
  password: config.get('MYSQL_PASSWORD'),
  database: 'instaclone'
};

if (config.get('INSTANCE_CONNECTION_NAME') && config.get('NODE_ENV') === 'production') {
  options.socketPath = `/cloudsql/${config.get('INSTANCE_CONNECTION_NAME')}`;
}

const connection = mysql.createConnection(options);

function create (data, cb) {

  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return cb(err); }

    // hash (encrypt) password with salt
    bcrypt.hash(data.password, salt, null, (err, hash) => {
      if (err) { return cb(err); }

      // overwrite plain text password w/ encrypted password
      data.password = hash;

      connection.query('INSERT INTO `users` SET ?', data, (err, res) => {
        if (err) {
          cb(err);
          return;
        }
        read(res.insertId, cb);
      });

    });
  });

}

function read (id, cb) {
  connection.query(
    'SELECT * FROM `users` WHERE `id` = ?', id, (err, results) => {
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
    'UPDATE `users` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      read(id, cb);
    });
}

function _delete (id, cb) {
  connection.query('DELETE FROM `users` WHERE `id` = ?', id, cb);
}

function readByUsername (username, cb) {
  connection.query(
    'SELECT * FROM `users` WHERE `username` = ?', username, (err, results) => {
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

function readByEmail (email, cb) {
  connection.query(
    'SELECT * FROM `users` WHERE `email` = ?', email, (err, results) => {
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

function comparePassword (candidatePassword, userPassword, done) {
  bcrypt.compare(candidatePassword, userPassword, function(err, isMatch) {
    if (err) { return done(err); }
    done(null, isMatch);
  });
}

module.exports = {
  create: create,
  read: read,
  update: update,
  delete: _delete,
  readByUsername: readByUsername, 
  readByEmail: readByEmail,
  comparePassword: comparePassword
};
