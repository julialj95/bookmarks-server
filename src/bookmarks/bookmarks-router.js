const express = require("express");
const { v4: uuid } = require("uuid");
const logger = require("../logger.js");
const validUrl = require("valid-url");
const { bookmarks } = require("../store.js");

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;

    if (!title) {
      logger.error("Title is required");
      res.status(400).send("Please enter valid bookmark title.");
    }
    if (!url) {
      logger.error("Url is required");
      res.status(400).send("Please enter a valid bookmark url.");
    }
    if (!validUrl.isUri(url)) {
      logger.error("Url is invalid");
      res.status(400).send("Please enter a valid url.");
    }
    if (!description) {
      logger.error("Description is required");
      res.status(400).send("Please enter a valid bookmark description");
    }
    if (!rating) {
      logger.error("Rating is required");
      res.status(400).send("Please enter a valid bookmark rating.");
    }

    const id = uuid();

    const newBookmark = {
      id,
      title,
      url,
      description,
      rating,
    };

    bookmarks.push(newBookmark);

    logger.info(`Bookmark with id ${id} created.`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(newBookmark);
  });

bookmarksRouter
  .route("/bookmarks/:id")
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.filter((bm) => bm.id === id);

    if (bookmark.length === 0) {
      logger.error(`No bookmark found with id ${id}`);
      res.status(404).send("Bookmark not found.");
    }
    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;

    const bookmark = bookmarks.filter((bm) => {
      bm.id === id;
    });

    if (bookmark.length === 0) {
      logger.error(`Bookmark with id ${id} not found.`);
      res.status(404).send("Not found");
    }

    for (let i = 0; i < bookmarks.length; i++) {
      if (bookmarks[i].id === id) {
        bookmarks.splice(i, 1);
      }
    }

    logger.info(`Card with id ${id} deleted.`);
    res.status(204).end();
  });

module.exports = bookmarksRouter;
