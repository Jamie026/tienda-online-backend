const { Sequelize } = require("sequelize");
require("dotenv").config();

const usarSSL = process.env.DB_SSL === "true";

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: false,
        timezone: "-05:00",
        dialectOptions: {
            dateStrings: true,
            typeCast: true
        }
    }
);

module.exports = sequelize;
