"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_controller_1 = __importDefault(require("../controllers/message.controller"));
const index_middlewares_1 = require("../middlewares/index.middlewares");
const user_validator_schema_1 = __importDefault(require("../validators/user.validator.schema"));
const router = express_1.default.Router();
const messageController = new message_controller_1.default();
router.post("/create", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.validator)(user_validator_schema_1.default.createMessageSchema), messageController.createMessage);
router.get("/:userId", (0, index_middlewares_1.Auth)(), messageController.getAllMessagesByUserId);
router.get("/conversation/:senderId/:receiverId", messageController.getConversation);
router.put("/:messageId/read", (0, index_middlewares_1.Auth)(), messageController.markMessageAsRead);
exports.default = router;
