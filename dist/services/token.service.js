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
const moment_1 = __importDefault(require("moment"));
const token_datasource_1 = __importDefault(require("../datasources/token.datasource"));
const index_utils_1 = __importDefault(require("../utils/index.utils"));
class TokenService {
    constructor() {
        this.tokenExpires = 5;
        this.TokenTypes = {
            FORGOT_PASSWORD: "FORGOT_PASSWORD",
        };
        this.TokenStatus = {
            NOTUSED: "NOTUSED",
            USED: "USED",
        };
        this.tokenDataSource = new token_datasource_1.default();
    }
    getTokenByField(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: Object.assign({}, record), raw: true };
            return this.tokenDataSource.fetchOne(query);
        });
    }
    createForgotPasswordToken(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenData = {
                key: email,
                type: this.TokenTypes.FORGOT_PASSWORD,
                expires: (0, moment_1.default)().add(this.tokenExpires, "minutes").toDate(),
                status: this.TokenStatus.NOTUSED,
            };
            let token = yield this.createToken(tokenData);
            return token;
        });
    }
    createToken(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenData = Object.assign({}, record);
            let validCode = false;
            while (!validCode) {
                tokenData.code = index_utils_1.default.generateCode(6);
                const isCodeExist = yield this.getTokenByField({ code: tokenData.code });
                if (!isCodeExist) {
                    validCode = true;
                    break;
                }
            }
            return this.tokenDataSource.create(tokenData);
        });
    }
    updateRecord(searchBy, record) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: Object.assign({}, searchBy), raw: true };
            yield this.tokenDataSource.updateOne(record, query);
        });
    }
}
exports.default = TokenService;
