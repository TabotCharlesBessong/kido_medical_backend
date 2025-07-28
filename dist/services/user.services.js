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
Object.defineProperty(exports, "__esModule", { value: true });
// import { raw } from "express"
class UserService {
    constructor(userDataSource, tokenDataSource) {
        this.userDataSource = userDataSource;
        this.tokenDataSource = tokenDataSource;
    }
    getUserByField(record) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Searching for user with criteria:', record);
                const query = { where: Object.assign({}, record), raw: true };
                const user = yield this.userDataSource.fetchOne(query);
                console.log('User search result:', user ? 'Found' : 'Not found');
                return user;
            }
            catch (error) {
                console.error('Error in getUserByField:', error);
                throw error;
            }
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
    logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Invalidate the token in your preferred way, such as deleting it from a token store or setting a flag in the database
            }
            catch (error) {
                throw new Error("Failed to log out.");
            }
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.userDataSource.fetchAll(query);
        });
    }
}
exports.default = UserService;
