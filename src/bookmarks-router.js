'use strict';
const express = require('express');
const uuid = require('uuid/v4');
const { isWebUri } = require('valid-url');
const logger = require('./logger');
const { bookmarks } = require('./store');
const BookmarksService = require('./bookmarks-service.js');
const xss = require('xss');

const bookmarksRouter = express.Router();
const bodyParser = express.json();


bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const newBookmark = {title, url, description, rating}; 
    // the advantage of this approach is the code is cleaner
    // the disadvantage is the error message is less specific
    if(!title || !url || !rating) {
      logger.error('Title, url, and rating are required');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`);
      // eslint-disable-next-line quotes
      return res.status(400).send(`'url' must be a valid URL`);
    }
    BookmarksService.insertBookmark(req.app.get('db'), newBookmark)
      .then(bookmark => {
        res 
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(bookmark)
      })
      .catch(next)

    // logger.info(`Bookmark with the id ${id} created.`);
  });

bookmarksRouter
  .route('/:id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getById(knexInstance, req.params.id)
      .then(bookmark => {
        if(!bookmark){
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist` }
          });
        }
        res.json({
          id: bookmark.id,
          title: xss(bookmark.title), // sanitize title
          url: xss(bookmark.url),
          description: xss(bookmark.description),
          rating: bookmark.rating,
          })
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    // const { id } = req.params;
     const knexInstance = req.app.get('db');
    // const bookmarkIndex = bookmarks.findIndex( b => b.id === id);

    // if (bookmarkIndex === -1) {
    //   logger.error(`Bookmark with the id ${id} is not found`);
    //   return res
    //     .status(404)
    //     .send('Not found');
    // }
    
    BookmarksService.deleteBookmark(knexInstance, req.params.id)
      .then(bookmark => {
        if(!bookmark) {
          return res.status(404).json({
            error: { message: `bookmark doesn't exist`}
          });
        }
        res
          .status(204)
          .end()
      })
      .catch(next)
  });

module.exports = bookmarksRouter;