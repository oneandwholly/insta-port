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

module.exports = {
    getFollowedByCountByUserId,
    getFollowedByCountByUserId,
    getBothCountsByUserId
  };