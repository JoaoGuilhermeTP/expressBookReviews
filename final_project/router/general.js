const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
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
    return res.status(404).json({message: "Book not found"})
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  // Get author from request parameters
  const authorName = req.params.author.toLowerCase();
  // Make array of key/value pairs from books object
  const booksArray = Object.entries(books);
  // Filter array by author name
  const filteredBooks = booksArray.filter(([key, value]) => value.author.toLowerCase() === authorName);
  // Check if filtered array is not empty
  if (filteredBooks.length > 0) {
    // Send filtered books
    return res.send(Object.fromEntries(filteredBooks));
  } else {
    // Send not found response
    return res.status(404).json({message: "Author not found"});
  }

});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.general = public_users;
