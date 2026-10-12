// Import the libraries used to create the server, manage sessions, and validate JWTs.
const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");

// Load the route groups defined in the router files.
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

// Create the Express application and enable JSON request bodies.
const app = express();
app.use(express.json());

// Keep customer login sessions under the /customer route namespace.
app.use(
    "/customer",
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true,
    }),
);

// Protect customer authentication endpoints with the access token stored in the session.
app.use("/customer/auth/*", function auth(req, res, next) {
    // A session without an authorization object means the user has not logged in.
    if (req.session.authorization) {
        let token = req.session.authorization["accessToken"];

        // Verify the token before allowing the request to reach the route handler.
        jwt.verify(token, "fingerprint_customer", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Register the protected customer routes and the public general routes.
const PORT = 5000;
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start listening for HTTP requests on the configured port.
app.listen(PORT, () => console.log("Server is running"));
