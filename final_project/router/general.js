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
public_users.get("/", async function (req, res) {
  try {
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });

    const allBooks = await getBooks;
    return res.status(200).json(allBooks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching book list." });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const findBook = new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject({ status: 404, message: "Book not found" });
      }
    });

    const bookDetails = await findBook;
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author;
    const findBooks = new Promise((resolve, reject) => {
      const filteredBooks = filterBooksBy("author", author);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ status: 404, message: "Author not found" });
      }
    });
    const booksByAuthor = await findBooks;
    return res.status(200).json(Object.fromEntries(booksByAuthor));
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const findBooks = new Promise((resolve, reject) => {
      const filteredBooks = filterBooksBy("title", req.params.title);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({status: 404, message: "Books not found"})
      }
    });
    const booksByTitle = await findBooks;
    return res.status(200).json(Object.fromEntries(booksByTitle));
  } catch(error) {
    return res.status(error.status || 500).json({ message: error.message });
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
