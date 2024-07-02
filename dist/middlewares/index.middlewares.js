"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorMiddleware = exports.Auth = exports.validator = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const code_enum_1 = require("../interfaces/enum/code.enum");
const user_enum_1 = require("../interfaces/enum/user.enum");
const user_services_1 = __importDefault(require("../services/user.services"));
const index_utils_1 = __importDefault(require("../utils/index.utils"));
const userService = new user_services_1.default();
const validator = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield schema.validate(req.body, { abortEarly: false });
            next();
        }
        catch (error) {
            return index_utils_1.default.handleError(res, error.errors[0], code_enum_1.ResponseCode.BAD_REQUEST);
        }
    });
};
exports.validator = validator;
const Auth = () => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            let token = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
            if (index_utils_1.default.isEmpty(token)) {
                throw new TypeError("Authorization failed");
            }
            token = token.split(" ")[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            if (decoded && decoded.id) {
                const user = yield userService.getUserByField({ id: decoded.id });
                if (!user) {
                    throw new TypeError("Authorization failed");
                }
                if (user.accountStatus == "DELETED") {
                    throw new TypeError("Authorization failed");
                }
                req.body.user = decoded;
                next();
            }
        }
        catch (error) {
            return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.BAD_REQUEST);
        }
    });
};
exports.Auth = Auth;
const DoctorMiddleware = () => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            let token = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
            if (index_utils_1.default.isEmpty(token))
                throw new TypeError("Authorization failed");
            token = token.split(" ")[1];
            const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            if (decode && decode.id) {
                const user = yield userService.getUserByField({ id: decode.id });
                if (!user)
                    throw new TypeError("Authorization failed");
                if (user.role !== user_enum_1.UserRoles.DOCTOR)
                    throw new TypeError("Authorization failed");
                if (user.accountStatus == "DELETED")
                    throw new TypeError("Account does not exist");
            }
            req.body.user = decode;
            next();
        }
        catch (error) {
            return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.BAD_REQUEST);
        }
    });
};
exports.DoctorMiddleware = DoctorMiddleware;
