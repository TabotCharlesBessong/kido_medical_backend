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
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
module.exports = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        const saltRounds = 10;
        const users = [
            {
                id: (0, uuid_1.v4)(),
                username: "johndoe",
                password: yield bcrypt_1.default.hash("password1", saltRounds),
                email: "johndoe@gmail.com",
                role: "DOCTOR",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: (0, uuid_1.v4)(),
                username: "janesmith",
                password: yield bcrypt_1.default.hash("password2", saltRounds),
                email: "janesmith@gmail.com",
                role: "DOCTOR",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: (0, uuid_1.v4)(),
                username: "emilyjohnson",
                password: yield bcrypt_1.default.hash("password3", saltRounds),
                email: "emilyjohnson@gmail.com",
                role: "DOCTOR",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: (0, uuid_1.v4)(),
                username: "alicebrown",
                password: yield bcrypt_1.default.hash("password4", saltRounds),
                email: "alicebrown@gmail.com",
                role: "PATIENT",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: (0, uuid_1.v4)(),
                username: "bobgreen",
                password: yield bcrypt_1.default.hash("password5", saltRounds),
                email: "bobgreen@gmail.com",
                role: "PATIENT",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: (0, uuid_1.v4)(),
                username: "charlieblack",
                password: yield bcrypt_1.default.hash("password6", saltRounds),
                email: "charlieblack@gmail.com",
                role: "PATIENT",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
        yield queryInterface.bulkInsert("Users", users);
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.bulkDelete("Users", {});
    }),
};
