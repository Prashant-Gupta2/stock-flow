const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const caPath = path.resolve(__dirname, "../certs/ca.pem");

if (!fs.existsSync(caPath)) {
  throw new Error(`CA certificate not found: ${caPath}`);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(caPath, "utf8"),
        rejectUnauthorized: true,
      },
    },
  }
);

module.exports = sequelize;