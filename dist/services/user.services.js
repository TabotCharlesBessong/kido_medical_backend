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
// import { where } from "sequelize"
const user_datasource_1 = __importDefault(require("../datasources/user.datasource"));
// import { raw } from "express"
class UserService {
    constructor() {
        this.userDataSource = new user_datasource_1.default();
    }
    getUserByField(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: Object.assign({}, record), raw: true };
            return this.userDataSource.fetchOne(query);
        });
    }
    createUser(record) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userDataSource.create(record);
        });
    }
    updateRecord(searchBy, record) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: Object.assign({}, searchBy) };
            yield this.userDataSource.updateOne(query, record);
        });
    }
    updateUserRole(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.getUserByField({ id: userId });
                if (user) {
                    yield this.updateRecord({ id: userId }, { role });
                }
            }
            catch (error) {
                throw new Error("Failed to update user role.");
            }
        });
    }
}
exports.default = UserService;
