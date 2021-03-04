const express = require("express");
const { v4: uuid } = require("uuid");
const logger = require("../logger.js");
const validUrl = require("valid-url");
const { bookmarks } = require("../store.js");
const { ConsoleTransportOptions } = require("winston/lib/winston/transports");

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route("/bookmarks")
  .get((req, res) => {
    if (bookmarks.length === 0) {
      return res.status(200).send("There are currently no bookmarks.");
    }
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;

    if (!title) {
      logger.error("Title is required");
      return res.status(400).send("Please enter valid bookmark title.");
    }
    if (!url) {
      logger.error("Url is required");
      return res.status(400).send("Please enter a valid bookmark url.");
    }
    if (!validUrl.isUri(url)) {
      logger.error("Url is invalid");
      return res.status(400).send("Please enter a valid url.");
    }
    if (!description) {
      logger.error("Description is required");
      return res.status(400).send("Please enter a valid bookmark description");
    }
    if (!rating) {
      logger.error("Rating is required");
      return res.status(400).send("Please enter a valid bookmark rating.");
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
    const bookmark = bookmarks.find((bm) => bm.id === id);

    if (!bookmark) {
      logger.error(`No bookmark found with id ${id}`);
      return res.status(404).send("Bookmark not found.");
    }
    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = bookmarks.findIndex((bm) => bm.id === id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Not found");
    }

    bookmarks.splice(bookmarkIndex, 1);
    logger.info(`Card with id ${id} deleted.`);
    res.status(204).end();
  });

module.exports = bookmarksRouter;
