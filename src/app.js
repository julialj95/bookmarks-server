require("dotenv").config();
const { NODE_ENV } = require("./config.js");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const bookmarksRouter = require("./bookmarks/bookmarks-router.js");
const errorHandler = require("./error-handler.js");
const validateBearerToken = require("./authorization.js");
const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(validateBearerToken);

app.use(bookmarksRouter);

app.use(errorHandler);

module.exports = app;
