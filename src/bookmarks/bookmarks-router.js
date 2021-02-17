const express = require("express");
const { v4: uuid } = require("uuid");
const logger = require("../logger.js");
const { bookmarks } = require("../store.js");

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, desc, rating } = req.body;

    if (!title) {
      logger.error("Title is required");
      res.status(400).send("Please enter valid bookmark title.");
    }
    if (!url) {
      logger.error("Url is required");
      res.status(400).send("Please enter a valid bookmark url.");
    }
    if (!desc) {
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
      desc,
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

    if (!bookmark) {
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

    if (!bookmark) {
      logger.error(`Card with id ${id} not found.`);
      return res.status(404).send("Not found");
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
