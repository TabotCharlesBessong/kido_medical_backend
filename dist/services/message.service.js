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
const notification_enum_1 = require("../interfaces/enum/notification.enum");
const user_services_1 = __importDefault(require("./user.services"));
class MessageService {
    constructor(messageDataSource, notificationDataSource) {
        this.messageDataSource = messageDataSource;
        this.notificationDataSource = notificationDataSource;
        this.userService = new user_services_1.default();
    }
    createMessage(record) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Creating message with record:', record);
            // First verify the receiver exists
            const receiver = yield this.userService.getUserByField({ id: record.receiverId });
            console.log('Receiver lookup result:', receiver ? 'Found' : 'Not found');
            if (!receiver) {
                throw new Error("Receiver not found");
            }
            // Then verify the sender exists
            const sender = yield this.userService.getUserByField({ id: record.senderId });
            console.log('Sender lookup result:', sender ? 'Found' : 'Not found');
            if (!sender) {
                throw new Error("Sender not found");
            }
            // Create the message
            const message = yield this.messageDataSource.create(record);
            // Create notification
            yield this.notificationDataSource.create({
                userId: record.receiverId,
                referenceId: message.id,
                message: `New message from ${sender.firstname} ${sender.lastname}`,
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
