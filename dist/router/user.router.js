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
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const index_middlewares_1 = require("../middlewares/index.middlewares");
const user_validator_schema_1 = __importDefault(require("../validators/user.validator.schema"));
const createUserRoute = () => {
    const router = express_1.default.Router();
    const userController = new user_controller_1.default();
    router.post("/register", (0, index_middlewares_1.validator)(user_validator_schema_1.default.registrationSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield userController.register(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/login", (0, index_middlewares_1.validator)(user_validator_schema_1.default.loginSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield userController.login(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/forgot-password", (0, index_middlewares_1.validator)(user_validator_schema_1.default.forgotPasswordSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield userController.forgotPassword(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/reset-password", (0, index_middlewares_1.validator)(user_validator_schema_1.default.resetPasswordSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield userController.resetPassword(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/verify-account", (0, index_middlewares_1.validator)(user_validator_schema_1.default.verifyAccountSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield userController.verifyAccount(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/logout", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield userController.logout(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/users/all", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield userController.getAllUsers(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
};
exports.default = createUserRoute();
