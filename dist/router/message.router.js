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
const message_controller_1 = __importDefault(require("../controllers/message.controller"));
const index_middlewares_1 = require("../middlewares/index.middlewares");
const message_validator_schema_1 = __importDefault(require("../validators/message.validator.schema"));
const router = express_1.default.Router();
const messageController = new message_controller_1.default();
router.post("/create", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.validator)(message_validator_schema_1.default.createMessageSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield messageController.createMessage(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.get("/:userId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield messageController.getAllMessagesByUserId(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.get("/conversation/:senderId/:receiverId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield messageController.getConversation(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.put("/:messageId/read", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield messageController.markMessageAsRead(req, res);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
