"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const code_enum_1 = require("../interfaces/enum/code.enum");
const index_utils_1 = __importDefault(require("../utils/index.utils"));
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            index_utils_1.default.handleError(res, 'Authentication token is required', code_enum_1.ResponseCode.UNAUTHORIZED);
            return;
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_KEY, (err, user) => {
            if (err) {
                index_utils_1.default.handleError(res, 'Invalid or expired token', code_enum_1.ResponseCode.UNAUTHORIZED);
                return;
            }
            req.body.user = user;
            next();
        });
    }
    catch (error) {
        index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
    }
};
exports.authenticateToken = authenticateToken;
