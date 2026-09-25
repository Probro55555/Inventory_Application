/* const { Pool } = require("pg");

module.exports = new Pool({
  host: "localhost", // or wherever the db is hosted
  user: "probro",
  database: "game_management",
  password: "prouser@1",
  port: 5432, // The default port
});
 */

/* const { Pool } = require("pg");
process.loadEnvFile();

module.exports = new Pool({
  connectionString: process.env.connectionString
});
 */
const { Pool } = require("pg");

try {
  process.loadEnvFile();
} catch (e) {
  // .env file not found
}

const connectionString =
  process.env.DATABASE_URL || process.env.connectionstring;

const isRemote =
  connectionString &&
  (connectionString.includes("neon.tech") ||
    connectionString.includes("sslmode=require"));

module.exports = new Pool({
  connectionString,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});