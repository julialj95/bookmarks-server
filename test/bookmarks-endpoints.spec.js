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

  describe("GET /api/bookmarks", () => {
    context("Given no bookmarks", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get("/api/bookmarks").expect(200, []);
      });
    });
    context("Given there are bookmarks in the database", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });
      it("responds with 200 and a list of bookmarks", () => {
        return supertest(app).get("/api/bookmarks").expect(200, testBookmarks);
      });
    });
  });

  describe("GET /api/bookmarks/:bookmark_id", () => {
    context("Given there are bookmarks in the database", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });
      it("Responds with 200 and the specified bookmark", () => {
        const bookmarkId = 2;
        const expectedBookmark = testBookmarks[bookmarkId - 1];
        return supertest(app)
          .get(`/api/bookmarks/${bookmarkId}`)
          .expect(200, expectedBookmark);
      });
    });
  });

  describe("POST /api/bookmarks", () => {
    context("It creates a new bookmark and responds with 201", () => {
      const bookmarksArray = makeBookmarksArray();
      const newBookmark = bookmarksArray[0];

      return supertest(app)
        .post("/api/bookmarks")
        .send(newBookmark)
        .expect((response) => {
          expect(response.body.title).to.eql(newBookmark.title);
          expect(response.body.url).to.eql(newBookmark.url);
          expect(response.body.description).to.eql(newBookmark.description);
          expect(response.body.rating).to.eql(newBookmark.rating);
          expect(response.body).to.have.property("id");
          expect(response.headers.location).to.eql(
            `/api/bookmarks/${response.body.id}`
          );
        })
        .then((postRes) => {
          return supertest(app)
            .get(`/api/bookmarks/${postRes.body.id}`)
            .expect(postRes.body);
        });
    });
  });
  describe("DELETE /api/bookmarks", () => {
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
          .delete(`/api/bookmarks/${idToRemove}`)
          .expect(204)
          .then(() =>
            supertest(app).get("/api/bookmarks").expect(expectedBookmarks)
          );
      });
    });
  });
  describe("PATCH /api/bookmarks/:bookmark_id", () => {
    context("Given no bookmarks", () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } });
      });
    });

    context("Given there are articles in the database", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("responds with 204 and updates the bookmark", () => {
        const idToUpdate = 1;
        const updateBookmark = {
          title: "updated bookmark title",
          url: "http://test.com",
          description: "updated bookmark description",
          rating: "4",
        };
        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updateBookmark,
        };

        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .send(updateBookmark)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .expect(expectedBookmark)
          );
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message: `Request body must contain either 'title', 'url', 'description' or 'rating'`,
            },
          });
      });
      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateBookmark = {
          title: "updated bookmark title",
        };
        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updateBookmark,
        };

        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .send({
            ...updateBookmark,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .expect(expectedBookmark)
          );
      });
    });
  });
});
