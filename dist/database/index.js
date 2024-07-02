"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database = process.env.DB_NAME;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const dialect = (_a = process.env.DB_DIALECT) !== null && _a !== void 0 ? _a : "postgres";
const host = process.env.DB_HOST;
// const port = parseInt(process.env.DB_PORT as string);
const sequelize = new sequelize_1.Sequelize(database, username, password, {
    host,
    dialect,
    // port,
    logging: false,
});
exports.default = sequelize;
