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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const moment_1 = __importDefault(require("moment"));
const code_enum_1 = require("../interfaces/enum/code.enum");
const user_enum_1 = require("../interfaces/enum/user.enum");
const email_service_1 = __importDefault(require("../services/email.service"));
const token_service_1 = __importDefault(require("../services/token.service"));
const user_services_1 = __importDefault(require("../services/user.services"));
const index_utils_1 = __importDefault(require("../utils/index.utils"));
class UserController {
    constructor() {
        this.userService = new user_services_1.default();
        this.tokenService = new token_service_1.default();
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                const newUser = {
                    firstname: params.firstname,
                    lastname: params.lastname,
                    email: params.email,
                    username: params.email.split("@")[0],
                    password: params.password,
                    role: user_enum_1.UserRoles.PATIENT,
                    isEmailVerified: user_enum_1.EmailStatus.NOT_VERIFIED,
                    accountStatus: user_enum_1.AccountStatus.ACTIVE,
                };
                newUser.password = bcrypt_1.default.hashSync(newUser.password, 10);
                let userExists = yield this.userService.getUserByField({
                    email: newUser.email,
                });
                if (userExists)
                    return index_utils_1.default.handleError(res, "User with email address already exists", code_enum_1.ResponseCode.ALREADY_EXIST);
                let user = yield this.userService.createUser(newUser);
                return index_utils_1.default.handleSuccess(res, "User registered successfully", { user }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                res.send({ message: "Server error" });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                let user = yield this.userService.getUserByField({ email: params.email });
                if (!user) {
                    return index_utils_1.default.handleError(res, "Invalid Login Detail", code_enum_1.ResponseCode.NOT_FOUND);
                }
                const passwordMatch = yield bcrypt_1.default.compare(params.password, user.password);
                if (!passwordMatch) {
                    return index_utils_1.default.handleError(res, "Invalid login detail", code_enum_1.ResponseCode.NOT_FOUND);
                }
                const token = jsonwebtoken_1.default.sign({
                    firstname: user.firstname,
                    lastname: user.lastname,
                    id: user.id,
                    email: user.email,
                    role: user.role,
                }, process.env.JWT_KEY, { expiresIn: "30d" });
                return index_utils_1.default.handleSuccess(res, "Login successful", { user, token }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                let user = yield this.userService.getUserByField({ email: params.email });
                if (!user) {
                    return index_utils_1.default.handleError(res, "Account does not exist!", code_enum_1.ResponseCode.NOT_FOUND);
                }
                const token = (yield this.tokenService.createForgotPasswordToken(params.email));
                yield email_service_1.default.sendForgotPasswordMail(params.email, token.code);
                return index_utils_1.default.handleSuccess(res, "Password reset code sent to your email", { token }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                let isValidToken = yield this.tokenService.getTokenByField({
                    key: params.email,
                    code: params.code,
                    type: this.tokenService.TokenTypes.FORGOT_PASSWORD,
                    status: this.tokenService.TokenStatus.NOTUSED,
                });
                if (!isValidToken) {
                    return index_utils_1.default.handleError(res, "Token has expired", code_enum_1.ResponseCode.NOT_FOUND);
                }
                if (isValidToken &&
                    (0, moment_1.default)(isValidToken.expires).diff((0, moment_1.default)(), "minute") <= 0) {
                    return index_utils_1.default.handleError(res, "Token has expired", code_enum_1.ResponseCode.NOT_FOUND);
                }
                let user = yield this.userService.getUserByField({ email: params.email });
                if (!user) {
                    return index_utils_1.default.handleError(res, "Invalid user records", code_enum_1.ResponseCode.NOT_FOUND);
                }
                const _password = bcrypt_1.default.hashSync(params.password, 10);
                yield this.userService.updateRecord({ id: user.id }, { password: _password });
                yield this.tokenService.updateRecord({ id: isValidToken.id }, { status: this.tokenService.TokenStatus.USED });
                return index_utils_1.default.handleSuccess(res, "Password reset successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
}
exports.default = UserController;
