// Express provides the router used to define the public API endpoints.
const express = require("express");

// Import the shared books data and the user helpers from auth_users.js.
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

// This router will later be mounted at the root path in index.js.
const public_users = express.Router();

// Find books whose chosen property contains the requested text.
const filterBooksBy = (atribute, goal) => {
  // Object.entries converts the books object into [ISBN, book] pairs.
  const booksArray = Object.entries(books);

  // Keep only pairs whose selected property matches the search text.
  const filteredBooks = booksArray.filter(([key, value]) => {
    // Some books may not have the requested property.
    if (!value[atribute]) {
      return false;
    } else {
      // toLowerCase makes the search case-insensitive.
      return value[atribute].toLowerCase().includes(goal.toLowerCase());
    }
  });
  return filteredBooks;
};

// Register a new user. This endpoint is available at POST /register.
public_users.post("/register", (req, res) => {
  // req.body contains values sent as JSON by the client.
  if (!req.body.username || !req.body.password) {
    return res.send("Must provide both username and password");
  }

  // Extract the credentials from the request body.
  const username = req.body.username;
  const password = req.body.password;

  // Do not create a second account with the same username.
  if (!isValid(username)) {
    return res.send("Username already in use. Please, pick another one.");
  }

  // Add the new user to the shared in-memory user list.
  users.push({ username: username, password: password });
  res.send("User registered!");
});

// Get all books available in the shop. This is GET /.
public_users.get("/", async function (req, res) {
  try {
    // A Promise represents an operation that will finish in the future.
    // Here it resolves immediately with the current books object.
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });

    // await pauses this function until the Promise provides its result.
    const allBooks = await getBooks;
    // json converts the JavaScript object into a JSON response.
    return res.status(200).json(allBooks);
  } catch (error) {
    // Send a server error if loading the books fails.
    console.error(error);
    return res.status(500).json({ message: "Error fetching book list." });
  }
});

// Get one book using its ISBN. This is GET /isbn/:isbn.
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    // :isbn is a route parameter, available through req.params.
    const isbn = req.params.isbn;
    const findBook = new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        // reject moves execution to the catch block below.
        reject({ status: 404, message: "Book not found" });
      }
    });

    const bookDetails = await findBook;
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Find books by author. This is GET /author/:author.
public_users.get("/author/:author", async function (req, res) {
  try {
    // Read the author text from the URL.
    const author = req.params.author;
    const findBooks = new Promise((resolve, reject) => {
      const filteredBooks = filterBooksBy("author", author);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        // No matching books means the author was not found.
        reject({ status: 404, message: "Author not found" });
      }
    });
    const booksByAuthor = await findBooks;
    // Convert the [ISBN, book] pairs back into an object for the response.
    return res.status(200).json(Object.fromEntries(booksByAuthor));
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Find books by title. This is GET /title/:title.
public_users.get("/title/:title", async function (req, res) {
  try {
    // Pass the title from the URL to the shared filtering function.
    const findBooks = new Promise((resolve, reject) => {
      const filteredBooks = filterBooksBy("title", req.params.title);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        // Reject when no title contains the requested text.
        reject({ status: 404, message: "Books not found" });
      }
    });
    const booksByTitle = await findBooks;
    // Return the matching books as a normal object instead of an array of pairs.
    return res.status(200).json(Object.fromEntries(booksByTitle));
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Get reviews for one book. This is GET /review/:isbn.
public_users.get("/review/:isbn", function (req, res) {
  // Find the requested book using the ISBN from the URL.
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  } else {
    const book = books[isbn];

    // Object.keys returns the usernames that have reviewed this book.
    if (Object.keys(book.reviews).length > 0) {
      // Return the existing reviews when at least one review is present.
      return res.send(`Reviews for the book "${book.title}", by ${book.author}: \n ${JSON.stringify(book.reviews)}`);
    } else {
      // Tell the client when the book has no reviews yet.
      return res.send(`The book "${book.title}", by ${book.author}, has no reviews yet.`);
    }
  }
});

// Export this router so index.js can attach it to the Express application.
module.exports.general = public_users;
