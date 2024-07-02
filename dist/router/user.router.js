"use strict";
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
    router.post("/register", (0, index_middlewares_1.validator)(user_validator_schema_1.default.registrationSchema), (req, res) => {
        return userController.register(req, res);
    });
    router.post("/login", (0, index_middlewares_1.validator)(user_validator_schema_1.default.loginSchema), (req, res) => {
        return userController.login(req, res);
    });
    router.post("/forgot-password", (0, index_middlewares_1.validator)(user_validator_schema_1.default.forgotPasswordSchema), (req, res) => {
        return userController.forgotPassword(req, res);
    });
    router.post("/reset-password", (0, index_middlewares_1.validator)(user_validator_schema_1.default.resetPasswordSchema), (req, res) => {
        return userController.resetPassword(req, res);
    });
    return router;
};
exports.default = createUserRoute();
