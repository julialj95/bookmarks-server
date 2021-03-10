const express = require("express");
const logger = require("../logger.js");
const validUrl = require("valid-url");
const xss = require("xss");
const path = require("path");
const app = require("../app.js");
const BookmarksService = require("./bookmarks-service.js");

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = (bookmark) => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating),
});

bookmarksRouter
  .route("/api/bookmarks")
  .get((req, res) => {
    BookmarksService.getAllBookmarks(req.app.get("db")).then((bookmarks) => {
      if (!bookmarks) {
        return res.status(200).send("There are currently no bookmarks.");
      }
      res.status(200).send(bookmarks);
    });
  })
  .post(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;

    for (const field of ["title", "url", "rating"]) {
      if (!req.body[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `'${field}' is required` },
        });
      }
    }

    const newBookmark = {
      title: title,
      url: url,
      description: description,
      rating: rating,
    };

    if (!validUrl.isUri(url)) {
      logger.error("Url is invalid");
      return res.status(400).send("Please enter a valid url.");
    }

    const ratingNum = Number(rating);

    if (!Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      logger.error(`Invalid rating '${rating}' supplied`);
      return res.status(400).send({
        error: { message: `'rating' must be a number between 0 and 5` },
      });
    }

    for (const [key, value] of Object.entries(newBookmark)) {
      if (value === null) {
        logger.error(`${key} is required.`);
        return res.status(400).json({
          error: { message: `Please enter a valid bookmark ${key}.` },
        });
      }
    }
    const knexInstance = req.app.get("db");
    BookmarksService.insertBookmark(knexInstance, newBookmark)
      .then((bookmark) => {
        logger.info(`Bookmark with id ${bookmark.id} created.`);
        res
          .status(201)
          .location(`/articles/${bookmark.id}`)
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
  });

bookmarksRouter
  .route("/api/bookmarks/:id")
  .get((req, res) => {
    const { id } = req.params;
    BookmarksService.getBookmarksById(req.app.get("db"), id).then(
      (bookmark) => {
        if (!bookmark) {
          logger.error(`No bookmark found with id ${id}`);
          return res.status(404).send("Bookmark not found.");
        }
        res.status(200).send(bookmark);
      }
    );
  })
  .delete((req, res) => {
    const { id } = req.params;
    // const knexInstance = req.app.get("db");

    BookmarksService.deleteBookmark(req.app.get("db"), id).then(() => {
      res.status(204).end();
    });
  })
  .patch(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const bookmarkToUpdate = { title, url, description, rating };
    // const knexInstance = req.app.get("db");

    // const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean)
    //   .length;
    // if (numberOfValues === 0) {
    //   return res.status(400).json({
    //     error: {
    //       message: `Request body must contain either 'title', 'url', 'description' or 'rating'`,
    //     },
    //   });
    // }

    BookmarksService.updateBookmark(
      req.app.get("db"),
      req.params.id,
      bookmarkToUpdate
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarksRouter;
