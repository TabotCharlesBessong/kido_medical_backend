"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const code_enum_1 = require("../interfaces/enum/code.enum");
const user_enum_1 = require("../interfaces/enum/user.enum");
const index_utils_1 = __importDefault(require("../utils/index.utils"));
const isAdmin = (req, res, next) => {
    try {
        const user = req.body.user;
        if (!user) {
            index_utils_1.default.handleError(res, 'User not authenticated', code_enum_1.ResponseCode.UNAUTHORIZED);
            return;
        }
        if (user.role !== user_enum_1.UserRoles.ADMIN) {
            index_utils_1.default.handleError(res, 'Access denied. Admin privileges required', code_enum_1.ResponseCode.BAD_REQUEST);
            return;
        }
        next();
    }
    catch (error) {
        index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
    }
};
exports.isAdmin = isAdmin;
