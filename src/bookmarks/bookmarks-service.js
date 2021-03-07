const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select("*").from("bookmarks");
  },

  getBookmarksById(knex, bookmarkId) {
    return knex.select("*").from("bookmarks").where("id", bookmarkId).first();
  },

  insertBookmark(knex, newBookmark) {
    return knex
      .into("bookmarks")
      .insert(newBookmark)
      .returning("*")
      .then(() => {
        // return response[0];
      });
  },

  deleteBookmark(knex, id) {
    return knex("bookmarks").where({ id }).delete();
  },
};

module.exports = BookmarksService;
