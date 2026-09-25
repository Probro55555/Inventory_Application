# Odin Inventory App

A video game inventory application built with Node.js, Express, EJS, and PostgreSQL as part of The Odin Project curriculum.

---

## Installation

Install the dependencies:
```bash
npm install
```

Create the PostgreSQL database:
```bash
createdb game_management
```

Create the tables and seed the data:
```bash
node db/populatedb.js
```

Set up the environment variables (see the configuration section below).

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
connectionstring=postgresql://<username>:<password>@localhost:5432/<database_name>
ADMIN_PASSCODE=your_secret_passcode
```

| Variable | Description |
| :--- | :--- |
| `PORT` | Local port number the Express server listens on (default: `3000`) |
| `connectionstring` | PostgreSQL connection URI for local or remote database access |
| `ADMIN_PASSCODE` | Secret passcode required to authorize edit and delete actions |

---

## Packages and Setup

| Package | Role | Where it's configured |
| :--- | :--- | :--- |
| **express** | Web framework | `app.js` — middleware, static assets, routing, error handling |
| **ejs** | Template engine | `app.js` — `app.set("view engine", "ejs")`; views stored in `views/` |
| **express-validator** | Server-side validation | `controllers/userController.js` — validates title, score, age rating, and image URLs |
| **pg** | PostgreSQL client | `db/pool.js` — connection pool handling local and remote connections |

---

## Project Structure

```text
odin-inventory-app/
├── app.js                     # Entry point: Express app, middleware, route mounting
├── controllers/
│   └── userController.js      # Route handling logic, validations, sanitization, admin check
├── db/
│   ├── pool.js                # PostgreSQL connection pool configuration
│   ├── populatedb.js          # Database schema initialization and sample seed data
│   └── queries.js             # SQL queries and database abstraction layer
├── routes/
│   ├── gameRouter.js          # Route definition for creating new game records (/new)
│   └── IndexRouter.js         # Core application routes (catalog, view, edit, delete)
├── views/
│   ├── error.ejs              # 404 and general error template
│   ├── form.ejs               # Create game form
│   ├── index.ejs              # Catalog view with search and sidebar filters
│   ├── indi_game.ejs          # Detailed game page and delete authorization modal
│   └── update_form.ejs        # Edit game form with passcode modal
├── public/
│   └── styles.css             # Frontend stylesheets
├── .env                       # Environment variables (not committed)
└── package.json
```

---

## Database Schema

PostgreSQL tables (defined in `db/populatedb.js`):
- **genres** — genre dictionary records (`genre_id`, `genre_name`, `info`)
- **developers** — studio portfolio records (`developer_id`, `developer_name`, `location`, `other_games`)
- **games** — core game catalog data (`game_id`, `name`, `age_rating`, `score`, `image_url`, `genre_id`, `developer_id`) with foreign key constraints referencing `genres` and `developers`

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `node app.js` | Starts the Express server using Node |

---

## Deployment Architecture & Strategy

This application is deployed using a decoupled stack to ensure continuous uptime and persistent data storage on a free tier.

### 1. The Hosting Stack

- **Backend Server:** Render (Web Service)
- **Database:** Neon.tech (Serverless PostgreSQL)

Render's native free PostgreSQL instances are terminated after 30 days. To keep the project operational without data expiration, the database is hosted externally on Neon.tech.

### 2. Database Setup (Neon.tech)

1. Created a serverless Postgres project on Neon.
2. Generated a cloud connection URI string containing SSL configuration flags (`?sslmode=require`).
3. Seeded all schema definitions and initial rows using `node db/populatedb.js "<NEON_CONNECTION_STRING>"`.
4. Resynced identity sequences for `game_id`, `genre_id`, and `developer_id` using `setval(pg_get_serial_sequence(...))` to prevent ID collisions during new inserts.

### 3. Codebase Preparation

- **Database Connection (`db/pool.js`):** Configured dynamic SSL settings. The pool inspects the connection string for `neon.tech` or `sslmode=require` and automatically attaches `{ ssl: { rejectUnauthorized: false } }`, preserving standard non-SSL behavior on localhost.
- **Route Specificity (`app.js`):** Mounted `/new` before wildcard index routes (`/`) so creation forms are evaluated before parameter matches like `/:id`.
- **Cloud Environment Variable Handling:** Used a non-blocking `try...catch` block around `process.loadEnvFile()`. On local machines, Node loads `.env`; on Render, the missing file is ignored while system-injected dashboard variables are consumed seamlessly via `process.env`.

### 4. Render Deployment Configuration

The Express app was deployed as a Render Web Service with the following configurations:
- **Build Command:** `npm install`
- **Start Command:** `node app.js`
- **Environment Variables:**
  - `connectionstring`: The Neon PostgreSQL connection string.
  - `ADMIN_PASSCODE`: The secret key checked during edit and delete requests.

---

## Key Features

- Full CRUD operations for game catalog entries
- Relational schema connecting games to genres and development studios
- Real-time catalog filtering by genre and developer alongside partial title search
- Server-side data validation and sanitization using `express-validator`
- Passcode-protected update and delete operations
- External image hosting support preventing asset loss across server rebuilds
