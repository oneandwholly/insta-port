// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const extend = require('lodash').assign;
const mysql = require('mysql');
const config = require('../config');

const options = {
  user: config.get('MYSQL_USER'),
  password: config.get('MYSQL_PASSWORD'),
  database: 'bookshelf'
};

if (config.get('INSTANCE_CONNECTION_NAME') && config.get('NODE_ENV') === 'production') {
  options.socketPath = `/cloudsql/${config.get('INSTANCE_CONNECTION_NAME')}`;
}

const connection = mysql.createConnection(options);

function list (limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'SELECT * FROM `books` LIMIT ? OFFSET ?', [limit, token],
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      const hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    }
  );
}

function create (data, cb) {
  connection.query('INSERT INTO `books` SET ?', data, (err, res) => {
    if (err) {
      cb(err);
      return;
    }
    read(res.insertId, cb);
  });
}

function read (id, cb) {
  connection.query(
    'SELECT * FROM `books` WHERE `id` = ?', id, (err, results) => {
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
    'UPDATE `books` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      read(id, cb);
    });
}

function _delete (id, cb) {
  connection.query('DELETE FROM `books` WHERE `id` = ?', id, cb);
}

module.exports = {
  createSchema: createSchema,
  list: list,
  create: create,
  read: read,
  update: update,
  delete: _delete
};

if (module === require.main) {
  const prompt = require('prompt');
  prompt.start();

  console.log(
    `Running this script directly will allow you to initialize your mysql database.
    This script will not modify any existing tables.`);

  prompt.get(['user', 'password'], (err, result) => {
    if (err) {
      return;
    }
    createSchema(result);
  });
}

function createSchema (config) {
  const connection = mysql.createConnection(extend({
    multipleStatements: true
  }, config));

  connection.query(
    `CREATE DATABASE IF NOT EXISTS \`instaclone\`
      DEFAULT CHARACTER SET = 'utf8'
      DEFAULT COLLATE 'utf8_general_ci';
    USE \`instaclone\`;
    CREATE TABLE IF NOT EXISTS \`instaclone\`.\`users\` (
      \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`username\` VARCHAR(255) NOT NULL,
      \`email\` VARCHAR(255) NOT NULL,
      \`password\` VARCHAR(255) NOT NULL,
      \`isPrivate\` TINYINT(1) DEFAULT 0 NOT NULL,
      \`createdAt\` TIMESTAMP DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS \`instaclone\`.\`photos\` (
      \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`img_url\` VARCHAR(255) NOT NULL,
      \`caption\` VARCHAR(255),
      \`user_id\` INT NOT NULL,
      \`createdAt\` TIMESTAMP DEFAULT NOW() NOT NULL,
      FOREIGN KEY(\`user_id\`) REFERENCES \`users\`(\`id\`)
    );`,
    (err) => {
      if (err) {
        throw err;
      }
      console.log('Successfully created schema');
      connection.end();
    }
  );
}


// CREATE TABLE users (
//   id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
//   username VARCHAR(255) NOT NULL UNIQUE,
//   email VARCHAR(255) NOT NULL UNIQUE,
//   password VARCHAR(255) NOT NULL,
//   isPrivate TINYINT(1) DEFAULT 0 NOT NULL,
//   created_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE photos (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   img_url VARCHAR(255) NOT NULL,
//   user_id INT NOT NULL,
//   caption VARCHAR(255),
//   created_at TIMESTAMP DEFAULT NOW(),
//   FOREIGN KEY(user_id) REFERENCES users(id)
// );