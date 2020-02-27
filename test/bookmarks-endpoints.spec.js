/* eslint-disable quotes */
'use strict';
const BookmarksService = require('../src/bookmarks-service');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe.only('Bookmarks Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  before(() => db('bookmarks_table').truncate());

  afterEach(() => db('bookmarks_table').truncate());
  
  after(() => db.destroy());

  describe('Get /bookmarks', () => {
    context('with no data', () => {
      it('responds with 200 and empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });
    
    context(`Given 'bookmarks_table' has data`, () =>{
      const testBookmarksArray = makeBookmarksArray();
      beforeEach(() => {
        return db('bookmarks_table')
          .insert(testBookmarksArray);
      });

      it('responds 200 and test bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBookmarksArray);
      });
    });
  });

  describe('Get /bookmarks/:id', () => {
    context('with no matching id', () => {
      it('responds with 404 not found', () => {
        const bookmarkId = 666;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404);
      });
    });
    context('with matching id', () => {
      const bookmarkArray = makeBookmarksArray();
      
      beforeEach('insert bookmarks', () => {
        return db 
          .into('bookmarks_table')
          .insert(bookmarkArray);
      });
      
      it('responds with 200 and bookmark of given id', () => {
        const bookmarkId = 3;
        const bookmark = bookmarkArray[bookmarkId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, bookmark);
      });
    });
  });

  describe('POST /bookmarks', () => {
    it('creates a bookmark, respondding eith a 201 and a new bookmark', function() {
      const newBookmark = {
        title: 'tester',
        url: 'https://www.test.com',
        description: 'test',
        rating: 1
    };
      return supertest(app)
        .post('/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.rating).to.eql(newBookmark.rating)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/bookmarks/${res.body.id}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(res.body)
          )
    });

    it('responds with 400 when title is missing', function() {
      const newBookmark = {
        title: null,
        url: 'https://www.test.com',
        description: 'test',
        rating: 1
    };
      return supertest(app)
        .post('/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(newBookmark)
        .expect(400)
    })
  });

  describe.only(`DELETE /bookmarks/:id`, () => {
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db 
          .into('bookmarks_table')
          .insert(testBookmarks)
      })
      
      it('responds with a 204 and removes the bookmark', () => {
        const idToRemove = 2;
        const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(res => 
            supertest(app)
              .get('/bookmarks')
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedBookmarks)
            )
      })
    })
  })
});