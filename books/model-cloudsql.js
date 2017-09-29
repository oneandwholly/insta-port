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
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`username\` VARCHAR(255) NOT NULL,
      \`email\` VARCHAR(255) NOT NULL,
      \`password\` VARCHAR(255) NOT NULL,
      \`created_time\` TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS \`instaclone\`.\`photos\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`image_url\` VARCHAR(255) NOT NULL,
      \`caption\` VARCHAR(255),
      \`user_id\` INT NOT NULL,
      \`created_time\` TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY(\`user_id\`) REFERENCES \`users\`(\`id\`)
    );
    CREATE TABLE IF NOT EXISTS \`instaclone\`.\`comments\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`text\` VARCHAR(255) NOT NULL,
      \`user_id\` INT NOT NULL,
      \`photo_id\` INT NOT NULL,
      \`created_time\` TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY(\`user_id\`) REFERENCES \`users\`(\`id\`),
      FOREIGN KEY(\`photo_id\`) REFERENCES \`photos\`(\`id\`)
    );
    CREATE TABLE IF NOT EXISTS \`instaclone\`.\`likes\` (
      \`user_id\` INT NOT NULL,
      \`photo_id\` INT NOT NULL,
      \`created_time\` TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY(\`user_id\`) REFERENCES \`users\`(\`id\`),
      FOREIGN KEY(\`photo_id\`) REFERENCES \`photos\`(\`id\`),
      PRIMARY KEY(\`user_id\`, \`photo_id\`)
    );
    CREATE TABLE IF NOT EXISTS \`instaclone\`.\`follows\` (
      \`follower_id\` INT NOT NULL,
      \`followee_id\` INT NOT NULL,
      \`created_time\` TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY(\`follower_id\`) REFERENCES \`users\`(\`id\`),
      FOREIGN KEY(\`followee_id\`) REFERENCES \`photos\`(\`id\`),
      PRIMARY KEY(\`follower_id\`, \`followee_id\`)
    );
    CREATE TABLE IF NOT EXISTS \`instaclone\`.\`tags\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`tag_name\` VARCHAR(255) UNIQUE NOT NULL,
      \`created_time\` TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS \`instaclone\`.\`photos_tags\` (
      \`photo_id\` INT NOT NULL,
      \`tag_id\` INT NOT NULL,
      FOREIGN KEY(\`photo_id\`) REFERENCES \`photos\`(\`id\`),
      FOREIGN KEY(\`tag_id\`) REFERENCES \`tags\`(\`id\`),
      PRIMARY KEY(\`photo_id\`, \`tag_id\`)
    );
    INSERT INTO users(\`username\`, \`email\`, \`password\`, \`created_time\`)
    VALUES 
    ('myuser', 'myuser@gmail.com', '$2a$10$1cjfHH.cXxdpcghtystxv.tvopoer9QkONaTRdA1fKDctK8hi1C6e', '2017-08-24 22:10:38'),
    ('followsme', 'followsme@gmail.com', '$2a$10$vYdDkPi79c1NRZnhWbp.AeSto2fb4t1RXG3TqJxix/B5cqhJGElae', '2017-08-25 22:10:38'),
    ('ifollow', 'ifollow@gmail.com', '$2a$10$tYAFUt2gUMIv1vNLpnXuAedilkpf/Bp/9t0j7ZbxGhKj1nUY1JGzm', '2017-08-26 22:10:38'),
    ('bothfollows', 'bothfollows@gmail.com', '$2a$10$Y8StH22uKjArdzK.iVA2YOhzOSfBUnX6rv6BLn01T0NRyBXnm.h4m', '2017-08-27 22:10:38'),
    ('stranger', 'stranger@gmail.com', '$2a$10$wj1fqz14c2ViKrQ/NQ.4muqOooMIY7D/kL5R29UAGD.0ZLLIsNWj.', '2017-08-28 22:10:38');
    
    INSERT INTO photos(\`image_url\`, \`caption\`, \`user_id\`, \`created_time\`)
    VALUES 
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:38'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:39'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:40'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:41'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:42'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:43'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:44'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:45'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:46'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:47'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:48'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:49'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:50'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:51'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:52'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:53'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:54'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:55'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:56'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:57'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:58'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:13:59'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:00'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:38'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:39'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:40'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:41'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:42'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:43'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:44'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:45'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:46'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:47'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:48'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:49'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:50'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:51'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:52'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', NULL, 1, '2017-08-24 22:14:53'),
    ('https://storage.googleapis.com/insta-port/1506643024331pic10.jpg', 'one like, one comment, and caption with no tags', 1, '2017-08-24 22:14:54'),
    ('https://storage.googleapis.com/insta-port/1506641844366pic9.jpg', 'view from the top..\n#NYC #view', 1, '2017-08-24 22:15:38'),

    ('https://storage.googleapis.com/insta-port/1506643283542pic5.jpg', NULL, 2, '2017-08-25 22:14:38'),
    ('https://storage.googleapis.com/insta-port/1506643327985pic1.jpg', NULL, 2, '2017-08-25 22:15:38'),
    ('https://storage.googleapis.com/insta-port/1506643342605pic2.jpg', NULL, 3, '2017-08-26 22:16:38'),
    ('https://storage.googleapis.com/insta-port/1506643353301pic3.jpg', NULL, 3, '2017-08-26 22:17:38'),
    ('https://storage.googleapis.com/insta-port/1506643367712pic4.jpg', 'this is the #view', 4, '2017-08-27 22:18:38'),
    ('https://storage.googleapis.com/insta-port/1506643381219pic6.jpg', NULL, 4, '2017-08-27 22:19:38'),
    ('https://storage.googleapis.com/insta-port/1506643393887pic7.jpg', NULL, 5, '2017-08-28 22:20:38'),
    ('https://storage.googleapis.com/insta-port/1506643403778pic8.gif', NULL, 5, '2017-08-28 22:21:38');
    
    INSERT INTO comments(\`text\`, \`user_id\`, \`photo_id\`, \`created_time\`)
    VALUES 
    ('cool first comment', 1, 41, '2017-09-05 22:13:38'),
    ('hmm second comment', 1, 41, '2017-09-05 22:13:39'),
    ('hi third comment', 2, 41, '2017-09-05 22:13:40'),
    ('what fourth comment', 2, 41, '2017-09-05 22:13:41'),
    ('wait fifth comment', 3, 41, '2017-09-05 22:13:42'),
    ('hello sixth comment', 3, 41, '2017-09-05 22:13:43'),
    ('maybe seventh comment', 4, 41, '2017-09-05 22:13:44'),
    ('wow eighth comment', 4, 41, '2017-09-05 22:13:45'),
    ('voila nineth comment', 5, 41, '2017-09-05 22:13:46'),
    ('more comment', 5, 41, '2017-09-05 22:13:57'),
    ('more comment', 5, 41, '2017-09-05 22:14:47'),
    ('more comment', 5, 41, '2017-09-05 22:15:47'),
    ('more comment', 5, 41, '2017-09-05 22:16:47'),
    ('more comment', 5, 41, '2017-09-05 22:17:47'),
    ('more comment', 5, 41, '2017-09-05 22:18:47'),
    ('more comment', 5, 41, '2017-09-05 22:19:47'),
    ('more comment', 5, 41, '2017-09-05 22:20:47'),
    ('more comment', 5, 41, '2017-09-05 22:21:47'),
    ('more comment', 5, 41, '2017-09-05 22:22:47'),
    ('more comment', 5, 41, '2017-09-05 22:23:47'),
    ('more comment', 5, 41, '2017-09-05 22:24:47'),
    ('finally last comment on the first picture', 5, 41, '2017-09-06 22:10:47'),

    ('one comment on the second picture', 5, 40, '2017-09-06 22:13:47');


    INSERT INTO likes(\`user_id\`, \`photo_id\`, \`created_time\`)
    VALUES
    ( 1, 41, '2017-09-07 22:13:23'),
    ( 2, 41, '2017-09-07 22:14:23'),
    ( 3, 41, '2017-09-07 22:15:23'),
    ( 4, 41, '2017-09-07 22:16:23'),
    ( 5, 41, '2017-09-07 22:17:23'),
    ( 5, 40, '2017-09-07 22:18:23');

    INSERT INTO follows(\`follower_id\`, \`followee_id\`, \`created_time\`)
    VALUES 
    ( 1, 3, '2017-09-08 22:13:23'),
    ( 2, 1, '2017-09-08 22:14:23'),
    ( 1, 4, '2017-09-08 22:15:23'),
    ( 4, 1, '2017-09-08 22:16:23');

    INSERT INTO tags(\`tag_name\`)
    VALUES 
    ('NYC'),
    ('view');
    
    INSERT INTO photos_tags(\`photo_id\`, \`tag_id\`)
    VALUES 
    (41, 1),
    (41, 2),
    (46, 2);
    `,
    (err) => {
      if (err) {
        throw err;
      }
      console.log('Successfully created schema');
      connection.end();
    }
  );
}