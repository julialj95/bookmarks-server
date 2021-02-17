const express = require("express");
const { v4: uuid } = require(uuid);
const { logger } = require("../logger.js");
const { bookmarks } = require("../store.js");

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  // returns a list of bookmarks
  .route("/bookmarks")
  .get((req, res) => {
    res.json(bookmarks);
  })
  //assigns a new id and posts bookmark to the list
  .post(bodyParser, (req, res) => {
    const { bookmark } = req.body;

    if (!bookmark) {
      logger.error("Bookmark is required");
      res.status(400).send("Please enter valid bookmark data.");
    }

    const id = uuid();

    const bookmark = {
      title,
      url,
      description,
      rating,
      id,
    };

    bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${id} created.`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
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

    logger.info(`Card with id ${id} deleted.`);
  });
