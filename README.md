# Express Book Reviews

An Express.js API for browsing books, registering users, logging in, and managing book reviews.

## Requirements

- Node.js and npm

## Installation

From the `final_project` directory, install the dependencies:

```bash
cd final_project
npm install
```

## Running the server

Start the development server with:

```bash
npm start
```

The API is available at `http://localhost:5000`.

## API endpoints

### Public endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | List all books |
| `GET` | `/isbn/:isbn` | Get a book by ISBN |
| `GET` | `/author/:author` | Find books by author |
| `GET` | `/title/:title` | Find books by title |
| `GET` | `/review/:isbn` | Get reviews for a book |
| `POST` | `/register` | Register a new user |

### Customer endpoints

Log in first with `POST /customer/login`. The server stores the JWT in a session cookie.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/customer/login` | Log in a registered user |
| `PUT` | `/customer/auth/review/:isbn?review=...` | Add or replace the user's review |
| `DELETE` | `/customer/auth/review/:isbn` | Delete the user's review |

Requests with JSON bodies should include:

```http
Content-Type: application/json
```

For registration and login, send a body containing `username` and `password`:

```json
{
	"username": "reader",
	"password": "secret"
}
```

Stop the server with `Ctrl+C`.