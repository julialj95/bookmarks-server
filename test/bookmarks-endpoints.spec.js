const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const makeBookmarksArray = require("./bookmarks-fixtures");

describe("Bookmarks endpoints", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });

    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db("bookmarks").truncate());

  afterEach("cleanup", () => db("bookmarks").truncate());

  describe("GET /bookmarks", () => {
    context("Given no bookmarks", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get("/bookmarks").expect(200, []);
      });
    });
    context("Given there are bookmarks in the database", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });
      it("responds with 200 and a list of bookmarks", () => {
        return supertest(app).get("/bookmarks").expect(200, testBookmarks);
      });
    });
  });

  describe("GET /bookmarks/:bookmark_id", () => {
    context("Given there are bookmarks in the database", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });
      it("Responds with 200 and the specified bookmark", () => {
        const bookmarkId = 2;
        const expectedBookmark = testBookmarks[bookmarkId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(200, expectedBookmark);
      });
    });
  });

  describe("POST /bookmarks", () => {
    context("It creates a new bookmark and responds with 201", () => {
      const bookmarksArray = makeBookmarksArray();
      const newBookmark = bookmarksArray[0];

      return supertest(app)
        .post("/bookmarks")
        .send(newBookmark)
        .expect((response) => {
          expect(response.body.title).to.eql(newBookmark.title);
          expect(response.body.url).to.eql(newBookmark.url);
          expect(response.body.description).to.eql(newBookmark.description);
          expect(response.body.rating).to.eql(newBookmark.rating);
          expect(response.body).to.have.property("id");
          expect(response.headers.location).to.eql(
            `/bookmarks/${response.body.id}`
          );
        })
        .then((postRes) => {
          return supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body);
        });
    });
  });
  describe("DELETE /bookmarks", () => {
    context("Given there are bookmarks in the database", () => {
      const testBookmarks = makeBookmarksArray();
      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("responds with 204 and removes the bookmark", () => {
        const idToRemove = 2;
        const expectedBookmarks = testBookmarks.filter(
          (bookmark) => bookmark.id !== idToRemove
        );
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .expect(204)
          .then(() =>
            supertest(app).get("/bookmarks").expect(expectedBookmarks)
          );
      });
    });
  });
});
