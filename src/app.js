require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config.js");
const logger = require("./logger.js");
const bookmarksRouter = require("./bookmarks/bookmarks-router.js");
const BookmarksService = require("./bookmarks/bookmarks-service.js");
const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get("/bookmarks", (req, res, next) => {
  const knexInstance = req.app.get("db");
  BookmarksService.getAllBookmarks(knexInstance)
    .then((bookmarks) => {
      if (!bookmarks) {
        console.log("bookmarks not found");
      }
      res.json(bookmarks);
    })
    .catch(next);
});

app.get("/bookmarks/:bookmark_id", (req, res, next) => {
  const knexInstance = req.app.get("db");
  const bookmarkId = req.params.bookmark_id;
  BookmarksService.getBookmarksById(knexInstance, bookmarkId)
    .then((bookmark) => {
      if (!bookmark) {
        console.log("bookmark not found");
      }
      res.json(bookmark);
    })
    .catch(next);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

// app.use(function validateBearerToken(req, res, next) {
//   const apiToken = process.env.API_KEY;
//   const authToken = req.get("Authorization");

//   if (!authToken || authToken.split(" ")[1] !== apiToken) {
//     logger.error(`Unauthorized request to path: ${req.path}`);
//     return res.status(401).json({ error: "Unauthorized request" });
//   }
//   next();
// });

app.use(bookmarksRouter);

module.exports = app;
