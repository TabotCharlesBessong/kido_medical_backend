"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const printRed = (text) => {
    console.log("\x1b[31m%s\x1b[0m", `${text} \n`);
};
const handleError = (res, message, statusCode = 400) => {
    logger.log({ level: "error", message });
    return res.status(statusCode).json({ status: false, message });
};
const handleSuccess = (res, message, data = {}, statusCode = 200) => {
    return res
        .status(statusCode)
        .json({ status: true, message, data: Object.assign({}, data) });
};
const generateCode = (num = 15) => {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substr(2);
    let result = randomness + dateString;
    result = result.length > num ? result.substring(0, num) : result;
    return result.toUpperCase();
};
const logger = (0, winston_1.createLogger)({
    transports: [
        new winston_1.transports.File({
            filename: "./logs/index.log",
            level: "error",
            format: winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.printf((info) => `${info.timestamp} ${info.level} : ${info.message} `)),
        }),
    ],
});
const isEmpty = (data) => {
    return !data || data.length === 0 || typeof data == 'undefined' || Object.keys(data).length == 0;
};
const escapeHtml = (html) => {
    return html.replace(/[&<>"']/g, '');
};
const parseToObject = (value) => {
    let counter = 0;
    let data = JSON.parse(value);
    while (counter <= 2) {
        if (typeof data == "object")
            break;
        else {
            data = JSON.parse(data);
            counter++;
        }
    }
    return data;
};
const Utility = {
    printRed,
    handleError,
    handleSuccess,
    generateCode,
    logger,
    isEmpty,
    escapeHtml,
    parseToObject
};
exports.default = Utility;
