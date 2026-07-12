const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const filterBooksBy = (atribute, goal) => {
  // Make array of key/value pairs from books object
  const booksArray = Object.entries(books);
  // Filter array by author name
  const filteredBooks = booksArray.filter(([key, value]) => {
    if (!value[atribute]) {
      return false;
    } else {
      return value[atribute].toLowerCase().includes(goal.toLowerCase());
    }
  });
  return filteredBooks;
};

public_users.post("/register", (req, res) => {

  if (!req.body.username || !req.body.password) {
    return res.send("Must provide both username and password");
  }

  const username = req.body.username;
  const password = req.body.password;
  if (!isValid(username)) {
    return res.send("Username already in use. Please, pick another one.");
  }

  users.push({"username": username, "password": password});
  res.send("User registered!");

});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.send(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  // Filter books array
  const filteredBooks = filterBooksBy("author", req.params.author);
  // Check if filtered array is not empty
  if (filteredBooks.length > 0) {
    // Send filtered books
    return res.send(Object.fromEntries(filteredBooks));
  } else {
    // Send not found response
    return res.status(404).json({ message: "Author not found" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  // Filter books array
  const filteredBooks = filterBooksBy("title", req.params.title);
  // Check if filtered array is not empty
  if (filteredBooks.length > 0) {
    // Send filtered books
    return res.send(Object.fromEntries(filteredBooks));
  } else {
    // Send not found response
    return res.status(404).json({ message: "Title not found" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  } else {
    const book = books[isbn];
    return res.send(
      `Reviews for the book "${book.title}", by ${book.author}: \n ${JSON.stringify(book.reviews)}`,
    );
  }
});

module.exports.general = public_users;
