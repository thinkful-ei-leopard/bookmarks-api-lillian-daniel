'use strict';

const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks_table');
  },
  getById(knex, id) {
    return knex
      .from('bookmarks_table')
      .select('*')
      .where('id', id)
      .first();
  },
  insertBookmark(knex, newBookmark) {
    return knex('bookmarks_table')
      .insert(newBookmark)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteBookmark(knex, id) {
    return knex('bookmarks_table')
      .where({ id })
      .delete();
  },
  updateBookmark(knex, id, newBookmarkData) {
    return knex('bookmarks_table')
      .where({ id })
      .update(newBookmarkData);
  }
};

module.exports = BookmarksService;