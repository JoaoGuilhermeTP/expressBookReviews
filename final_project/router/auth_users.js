const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  if (users.filter((user) => user.username === username) > 0) {
    return false;
  } else {
    return true;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  const filteredUseres = users.filter(
    (user) => user.username === username && user.password === password,
  );
  if (filteredUseres.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "fingerprint_customer",
      { expiresIn: 60 * 60 },
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    const book = books[isbn];
    const review = req.query.review;
    const username = req.session.authorization.username;
    books[isbn].reviews[username] = review;
    res.send(
      `Review added for book ${book.title}. Reviews: \n\n ${JSON.stringify(book.reviews)}`,
    );
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Extract username from the active session
  const username = req.session.authorization.username;

  // Check if the user has actually reviewed this book
  if (book.reviews && book.reviews[username]) {
    // Remove the user's review from the object
    delete book.reviews[username];

    return res.status(200).json({
      message: `Review by ${username} deleted successfully.`,
      reviews: book.reviews,
    });
  } else {
    // Handle the case where the user hasn't reviewed the book
    return res.status(404).json({
      message: "You do not have a review for this book to delete.",
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
