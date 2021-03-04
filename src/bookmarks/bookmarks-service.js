const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select("*").from("bookmarks");
  },

  getBookmarksById(knex, bookmarkId) {
    return knex.select("*").from("bookmarks").where("id", bookmarkId).first();
  },
};

module.exports = BookmarksService;
