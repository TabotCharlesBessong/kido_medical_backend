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
exports.up = up;
exports.down = down;
const user_types_1 = require("../../enums/user.types");
const bcrypt_1 = __importDefault(require("bcrypt"));
function up(queryInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedPassword = yield bcrypt_1.default.hash("admin123", 10);
        yield queryInterface.bulkInsert("users", [
            {
                id: "00000000-0000-0000-0000-000000000000",
                firstName: "Charles",
                lastName: "Bessong",
                email: "charlesbessongtabot@gmail.com",
                password: hashedPassword,
                userType: user_types_1.UserTypes.ADMIN,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    });
}
function down(queryInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        yield queryInterface.bulkDelete("users", {
            email: "charlesbessongtabot@gmail.com"
        });
    });
}
