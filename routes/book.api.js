const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();

//get
router.get("/", (req, res, next) => {
  // input validation (nếu có)
  const allowedFilter = [
    "author",
    "country",
    "language",
    "title",
    "page",
    "limit",
  ];

  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    let offset = limit * (page - 1);
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { books } = db;
    let result = [];
    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        result = result.length
          ? result.filter((book) => book[condition] === filterQuery[conditon])
          : books.filter((book) => book[condition] === filterQuery[condition]);
      });
    } else {
      result = books;
    }
    console.log(result);

    result = result.slice(offset, offset + limit);

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

// post
router.post("/", (req, res, next) => {
  try {
    const { author, country, imageLink, language, pages, title, year } =
      req.body;
    if (
      !author ||
      !country ||
      !imageLink ||
      !language ||
      !pages ||
      !title ||
      !year
    ) {
      const exception = new Error(`missing body info`);
      exception.statusCode = 401;
      throw exception;
    }

    const newBook = {
      author,
      country,
      imageLink,
      language,
      pages: parseInt(pages) || 1,
      title,
      year: parseInt(year) || 0,
      id: crypto.randomBytes(4).toString("hex"),
    };

    // Read data from db.json then parse to JSObject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { books } = db;

    // add new book to book JS object
    books.push(newBook);
    db.books = books;

    // convert db JSObject to JSON string
    db = JSON.stringify(db);

    // write and save to db.json
    fs.writeFileSync("db.json", db);

    // send response after successfully writing to db.json
    res.status(200).send(newBook);
  } catch (error) {
    next(error);
  }
});

// put
router.put("/:bookId", (req, res, next) => {
  const allowUpdate = [
    "author",
    "country",
    "imageLink",
    "language",
    "pages",
    "title",
    "year",
  ];
  const { bookId } = req.params;
  const updates = req.body;
  const updateKeys = Object.keys(updates);

  try {
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));
    if (notAllow.length) {
      const exception = new Error(`update field not allow`);
      exception.statusCode = 401;
      throw exception;
    }

    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { books } = db;

    const targetIndex = books.findIndex((book) => book.id === bookId);
    if (targetIndex < 0) {
      const exception = new Error(`Book not found`);
      exception.statusCode = 404;
      throw exception;
    }

    const updatedBook = { ...books[targetIndex], ...updates };
    books[targetIndex] = updatedBook;

    db.books = books;
    db = JSON.stringify(db);

    fs.writeFileSync("db.json", db);

    // send response
    res.status(200).send(updatedBook);
  } catch (error) {
    next(error);
  }
});

//delete
router.delete("/:bookId", (req, res, next) => {
  //delete input validation
  try {
    const { bookId } = req.params;
  } catch (error) {
    next(error);
  }

  //delete processing logic
  let db = fs.readFileSync("db.json", "utf-8");
  db = JSON.parse(db);
  const { books } = db;
  //find book by id
  const targetIndex = books.findIndex((book) => book.id === bookId);
  if (targetIndex < 0) {
    const exception = new Error(`book not found`);
    exception.statusCode = 404;
    throw exception;
  }
  //filter db books obj
  db.books = books.filter((book) => book.id !== bookId);
  db = JSON.stringify(db);
  fs.writeFileSync("db.json", db);
  //delete send response
  res.status(200).send({});
});

module.exports = router;
