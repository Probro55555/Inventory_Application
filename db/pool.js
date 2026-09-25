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
process.loadEnvFile();

const connectionString = process.env.connectionstring;

module.exports = new Pool({
  connectionString: connectionString,
  ssl:
    connectionString && connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : false,
});