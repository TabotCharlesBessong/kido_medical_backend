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
const notification_enum_1 = require("../interfaces/enum/notification.enum");
class MessageService {
    constructor(messageDataSource, notificationDataSource) {
        this.messageDataSource = messageDataSource;
        this.notificationDataSource = notificationDataSource;
    }
    createMessage(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.messageDataSource.create(record);
            yield this.notificationDataSource.create({
                userId: record.receiverId,
                messageId: message.id,
                message: `New message from ${record.senderId}`,
                read: false,
                type: notification_enum_1.NotificationType.MESSAGE,
            });
            return message;
        });
    }
    getAllMessagesByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.messageDataSource.fetchAllByUserId(userId);
        });
    }
    getConversation(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.messageDataSource.fetchConversation(senderId, receiverId);
        });
    }
    markMessageAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageDataSource.markAsRead(messageId);
        });
    }
    getAllNotificationsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.notificationDataSource.fetchAllByUserId(userId);
        });
    }
    markNotificationAsRead(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.notificationDataSource.markAsRead(notificationId);
        });
    }
}
exports.default = MessageService;
