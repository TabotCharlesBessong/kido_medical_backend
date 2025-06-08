"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: `${process.cwd()}/.env` });
module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: (_a = process.env.DB_DIALECT) !== null && _a !== void 0 ? _a : "postgres",
    },
    test: {
        username: "root",
        password: null,
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql",
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: (_b = process.env.DB_DIALECT) !== null && _b !== void 0 ? _b : "postgres",
    },
};
