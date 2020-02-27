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
});