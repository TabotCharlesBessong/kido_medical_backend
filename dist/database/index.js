"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: (_a = process.env.DB_DIALECT) !== null && _a !== void 0 ? _a : "postgres",
    logging: false,
});
exports.default = sequelize;
