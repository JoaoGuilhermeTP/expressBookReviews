// Express creates the router, while jsonwebtoken creates login tokens.
const express = require("express");
const jwt = require("jsonwebtoken");

// Import the shared books object so reviews can be added and removed.
let books = require("./booksdb.js");

// A router groups related endpoints before they are mounted in index.js.
const regd_users = express.Router();

// Users are kept in memory while the server is running.
// Restarting the server clears this array.
let users = [];

// Check whether a username is available for registration.
const isValid = (username) => {
  // Find users whose username matches the requested username.
  // The result is intended to determine whether a duplicate exists.
  if (users.filter((user) => user.username === username) > 0) {
    return false;
  } else {
    return true;
  }
};
// Check whether the supplied username and password belong to a registered user.

// filter returns every user matching both login values.
const authenticatedUser = (username, password) => {
  //returns boolean
  const filteredUseres = users.filter(
    // At least one matching user means that authentication succeeded.
    (user) => user.username === username && user.password === password,
  );
  if (filteredUseres.length > 0) {
    return true;
  } else {
    return false;
  }
};

// Only registered users can log in.
// This route is available at POST /customer/login after the router is mounted.
regd_users.post("/login", (req, res) => {
  // Read the credentials sent in the JSON request body.
  const username = req.body.username;
  const password = req.body.password;

  // Reject the request when either required value is missing.
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Continue only when the credentials match a registered user.
  if (authenticatedUser(username, password)) {
    // Create a signed token that expires after one hour.
    // The token proves that this user successfully logged in.
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "fingerprint_customer",
      { expiresIn: 60 * 60 },
    );

    // Store the token and username in the session.
    // The browser sends this session back on later authenticated requests.
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add or replace a review for a book.
// The complete endpoint is PUT /customer/auth/review/:isbn.
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Route parameters are values captured from the URL.
  const isbn = req.params.isbn;

  // Only add a review if the requested ISBN exists in the books object.
  if (books[isbn]) {
    const book = books[isbn];

    // The review text is read from the query string, for example:
    // /customer/auth/review/123?review=Great%20book
    const review = req.query.review;

    // The logged-in username identifies who wrote the review.
    const username = req.session.authorization.username;
    books[isbn].reviews[username] = review;

    // Send the updated review collection back to the client.
    res.send(`Review added for book ${book.title}. Reviews: \n\n ${JSON.stringify(book.reviews)}`);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Delete the logged-in user's review for a book.
// The complete endpoint is DELETE /customer/auth/review/:isbn.
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Look up the book using the ISBN from the URL.
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // The active session tells us which user's review may be deleted.
  const username = req.session.authorization.username;

  // Do not delete anything unless this user has reviewed the book.
  if (book.reviews && book.reviews[username]) {
    // delete removes the property whose key is the username.
    delete book.reviews[username];

    return res.status(200).json({
      message: `Review by ${username} deleted successfully.`,
      reviews: book.reviews,
    });
  } else {
    // Tell the client why there was nothing to delete.
    return res.status(404).json({
      message: "You do not have a review for this book to delete.",
    });
  }
});

// Export the router and shared values for use by other files.
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
