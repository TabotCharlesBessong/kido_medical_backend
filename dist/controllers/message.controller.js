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
const message_datasource_1 = __importDefault(require("../datasources/message.datasource"));
const code_enum_1 = require("../interfaces/enum/code.enum");
const message_service_1 = __importDefault(require("../services/message.service"));
const index_utils_1 = __importDefault(require("../utils/index.utils"));
const notification_datasource_1 = __importDefault(require("../datasources/notification.datasource"));
class MessageController {
    constructor() {
        this.createMessage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                const newMessage = {
                    senderId: params.user.id,
                    receiverId: params.receiverId,
                    content: params.content
                };
                const message = yield this.messageService.createMessage(newMessage);
                return index_utils_1.default.handleSuccess(res, "Post updated successfully", { message }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
        this.getAllMessagesByUserId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = yield this.messageService.getAllMessagesByUserId(req.params.userId);
                return index_utils_1.default.handleSuccess(res, "Post updated successfully", { messages }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
        this.getConversation = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = yield this.messageService.getConversation(req.params.senderId, req.params.receiverId);
                return index_utils_1.default.handleSuccess(res, "Post updated successfully", { messages }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
        this.markMessageAsRead = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.messageService.markMessageAsRead(req.params.messageId);
                return res.status(204).send();
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
        const messageDataSource = new message_datasource_1.default();
        const notificationDataSource = new notification_datasource_1.default();
        this.messageService = new message_service_1.default(messageDataSource, notificationDataSource);
    }
}
exports.default = MessageController;
