'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const User = require('./model');
const Photo = require('../photos/model');
const Follow = require('../follows/model');
const Tag = require('../tags/model');
const Comment = require('../comments/model');
const Like = require('../likes/model');

const jwt = require('jwt-simple');
const config = require('../config');

const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.get('JWT_SECRET'));
}

const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/users/self
 *
 * Get information about the owner of the access token.
 */

router.get('/self', requireAuth, (req, res, next) => {
  let self = req.user;
  delete self.password;
  self.counts = { photos: null, follows: null, followed_by: null };
  // get media, follows, followed_by counts
  Photo.getCountByUserId(self.id, (err, count) => {
    if (err) {
      next(err);
      return;
    }
    self.counts.photos = count.photo_count;

    Follow.getBothCountsByUserId(self.id, (err, counts) => {
      if (err) {
        next(err);
        return;
      }

      self.counts.follows = counts.follows_count;
      self.counts.followed_by = counts.followed_by_count;
  
      res.json(self);
    })
  })
})

/**
 * GET /api/users/:id
 *
 * Retrieve a user.
 */
router.get('/:id', requireAuth, (req, res, next) => {
    User.read(req.params.id, (err, user) => {
      if (err) {
        next(err);
        return;
      }

      delete user.password;

      // get media, follows, followed_by counts
      user.counts = { photos: null, follows: null, followed_by: null };
      Photo.getCountByUserId(user.id, (err, count) => {
        if (err) {
          next(err);
          return;
        }
        user.counts.photos = count.photo_count;
    
        Follow.getBothCountsByUserId(user.id, (err, counts) => {
          if (err) {
            next(err);
            return;
          }
    
          user.counts.follows = counts.follows_count;
          user.counts.followed_by = counts.followed_by_count;
      
          res.json(user);
        })
      })
    });
  });

/**
 * GET /api/users/self/photos/recent
 *
 * Get the most recent photos of the user.
 * 
 * req.query.max_id: return photos earlier than this max_id.
 */

 router.get('/self/photos/recent', requireAuth, (req, res, next) => {
  let self = req.user;
  delete self.password;

  Photo.listByUserId(self.id, 12, req.query.max_id, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }

    if (entities.length > 0) {
      let entitiesPromises = entities.map((photo) => {
        let photoPromise = new Promise((resolve, reject) => {
          
            photo.tags = [];
            photo.comments = { count: null };
            photo.likes = { count: null };
            photo.user = null;
            //tags, comment count, likes count, user info
            Tag.getTagsByPhotoId(photo.id, (err, tags) => {
              if (err) {
                reject(err);
                return;
              }
              tags.forEach((tag) => {
                photo.tags.push(tag.tag_name);
              })
        
              Comment.getCountByPhotoId(photo.id, (err, count) => {
                if (err) {
                  reject(err);
                  return;
                }
                photo.comments.count = count.comment_count;
                
                Like.getCountByPhotoId(photo.id, (err, count) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  photo.likes.count = count.like_count;
                  
                  User.read(photo.user_id, (err, user) => {
                    if (err) {
                      reject(err);
                      return;
                    }
        
                    delete photo.user_id;
                    delete user.password;
                    photo.user = user;
                    resolve(photo);
                  })
                })
              })
            })

        });

        return photoPromise;
      })

      let allPromises = Promise.all(entitiesPromises).then((values) => {
        res.json({
          photos: values,
          hasMore: cursor
        });
      }).catch((err) => {
        next(err);
      })


      return;
    }

    

    res.json({
      photos: entities,
      hasMore: cursor
    });
  });
 });


/**
 * GET /api/users/:id/photos/recent
 *
 * Get the most recent photos of a user.
 * 
 * req.query.max_id: return photos earlier than this max_id.
 */
router.get('/:id/photos/recent', requireAuth, (req, res, next) => {

  User.read(req.params.id, (err, user) => {
    if (err) {
      next(err);
      return;
    }

    delete user.password;
    Photo.listByUserId(user.id, 12, req.query.max_id, (err, entities, cursor) => {
      if (err) {
        next(err);
        return;
      }
  
      if (entities.length > 0) {
        let entitiesPromises = entities.map((photo) => {
          let photoPromise = new Promise((resolve, reject) => {
            
              photo.tags = [];
              photo.comments = { count: null };
              photo.likes = { count: null };
              photo.user = null;
              //tags, comment count, likes count, user info
              Tag.getTagsByPhotoId(photo.id, (err, tags) => {
                if (err) {
                  reject(err);
                  return;
                }
                tags.forEach((tag) => {
                  photo.tags.push(tag.tag_name);
                })
          
                Comment.getCountByPhotoId(photo.id, (err, count) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  photo.comments.count = count.comment_count;
                  
                  Like.getCountByPhotoId(photo.id, (err, count) => {
                    if (err) {
                      reject(err);
                      return;
                    }
                    photo.likes.count = count.like_count;
                    
                    User.read(photo.user_id, (err, user) => {
                      if (err) {
                        reject(err);
                        return;
                      }
          
                      delete photo.user_id;
                      delete user.password;
                      photo.user = user;
                      resolve(photo);
                    })
                  })
                })
              })
  
          });
  
          return photoPromise;
        })
  
        let allPromises = Promise.all(entitiesPromises).then((values) => {
          res.json({
            photos: values,
            hasMore: cursor
          });
        }).catch((err) => {
          next(err);
        })
  
  
        return;
      }
  
      
  
      res.json({
        photos: entities,
        hasMore: cursor
      });
    });
  });
 });


/**
 * GET /api/users/self/follows
 *
 * Get the list of users this user follows.
 * 
 * req.query.max_id: return rows earlier than this max_id.
 */
router.get('/self/follows', requireAuth, (req, res, next) => {
  Follow.getFolloweesByUserId(req.user.id, (err, users) => {
    if (err) {
      next(err);
      return;
    }

    res.json(users);
  })
});

/**
 * GET /api/users/self/followed_by
 *
 * Get the list of users this user is followed by.
 * 
 * req.query.max_id: return rows earlier than this max_id.
 */
router.get('/self/followed_by', requireAuth, (req, res, next) => {
  Follow.getFollowersByUserId(req.user.id, (err, users) => {
    if (err) {
      next(err);
      return;
    }

    res.json(users);
  })
});

router.get('/:id/relationship', requireAuth, (req, res, next) => {
  let self_id = req.user.id;
  let user_id = req.params.id;
  
  Follow.read(self_id, user_id, (err, follow) => {
    // outgoing_status: Your relationship to the user. Can be 'follows', 'none'.
    let outgoing_status = 'none';

    if (follow.length > 0 ) {
      outgoing_status = 'follows';
    }
    Follow.read(user_id, self_id, (err, follow) => {
      // incoming_status: A user's relationship to you. Can be 'followed_by', 'none'.
      let incoming_status = 'none';

      if (follow.length > 0 ) {
        incoming_status = 'followed_by';
      }

      res.json({ outgoing_status, incoming_status });
    })
  })
});

router.post('/:id/relationship', requireAuth, (req, res, next) => {
  let follower_id = req.user.id;
  let followee_id = req.params.id;

  if (req.query.action === 'follow') {
    Follow.create(follower_id, followee_id, (err, results) => {
      if (err) {
        next(err);
        return;
      }

      res.json({ outgoing_status: 'follows' });
    })
  } else if (req.query.action === 'unfollow') {
    Follow.delete(follower_id, followee_id, (err, results) => {
      if (err) {
        next(err);
        return;
      }

      res.json({ outgoing_status: 'none' });
    })
  }
});

/**
 * Errors on "/api/users/*" routes.
 */
router.use((err, req, res, next) => {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    err.response = {
      message: err.message,
      internalCode: err.code
    };
    next(err);
  });
  
  module.exports = router;