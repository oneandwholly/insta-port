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


function getFolloweesByUserId (user_id, cb) {
  connection.query(`SELECT id, username, email, users.created_time FROM follows INNER JOIN users ON followee_id=id WHERE follower_id=${user_id} ORDER BY follows.created_time DESC`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, results);
  })
}

function getFollowersByUserId (user_id, cb) {
  connection.query(`SELECT id, username, email, users.created_time FROM follows INNER JOIN users ON follower_id=id WHERE followee_id=${user_id} ORDER BY follows.created_time DESC`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, results);
  })
}

function getFollowsCountByUserId (user_id, cb) {

}

function getFollowedByCountByUserId (user_id, cb) {

}

function getBothCountsByUserId (user_id, cb) {
    connection.query(
        `SELECT SUM(follower_id = ${user_id}) as follows_count, SUM(followee_id = ${user_id}) as followed_by_count FROM follows WHERE followee_id = ${user_id} OR follower_id = ${user_id}`, user_id, (err, results) => {
          if (err) {
            cb(err);
            return;
          }
          if (results[0]['follows_count'] === null) {
            results[0]['follows_count'] = 0;
          } 
          if (results[0]['followed_by_count'] === null) {
            results[0]['followed_by_count'] = 0;
          } 
          cb(null, results[0]);
        });
}

function read (follower_id, followee_id, cb) {
  connection.query(`SELECT * FROM follows WHERE follower_id=${follower_id} AND followee_id=${followee_id}`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, results);
  })
}

function create (follower_id, followee_id, cb) {
  connection.query(`INSERT INTO follows (follower_id, followee_id) VALUES (${follower_id}, ${followee_id})`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, results);
  })
}

function _delete (follower_id, followee_id, cb) {
  connection.query(`DELETE FROM follows WHERE follower_id=${follower_id} AND followee_id=${followee_id}`, (err, results) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, results);
  })
}

module.exports = {
    getFolloweesByUserId,
    getFollowersByUserId,
    getFollowedByCountByUserId,
    getFollowedByCountByUserId,
    getBothCountsByUserId,
    read,
    create,
    delete: _delete
  };