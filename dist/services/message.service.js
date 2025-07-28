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
const user_services_1 = __importDefault(require("./user.services"));
const stream_service_1 = __importDefault(require("./stream.service"));
const user_datasource_1 = __importDefault(require("../datasources/user.datasource"));
const token_datasource_1 = __importDefault(require("../datasources/token.datasource"));
const userDataSource = new user_datasource_1.default();
const tokenDataSource = new token_datasource_1.default();
const userService = new user_services_1.default(userDataSource, tokenDataSource);
class MessageService {
    constructor(messageDataSource, notificationDataSource) {
        this.messageDataSource = messageDataSource;
        this.notificationDataSource = notificationDataSource;
        this.userService = userService;
    }
    createMessage(record) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!record.senderId || !record.receiverId || !record.content) {
                    throw new Error("Missing required message fields");
                }
                // Get or create a channel for the conversation
                const channel = yield stream_service_1.default.getOrCreateUserChannel(record.senderId, record.receiverId);
                if (!channel || !channel.id) {
                    throw new Error("Failed to create or get channel");
                }
                // Send the message through Stream
                const streamMessage = yield stream_service_1.default.sendMessage(channel.id, record.senderId, record.content);
                if (!streamMessage || !streamMessage.message) {
                    throw new Error("Failed to send message");
                }
                // Return a message object that matches our interface
                return {
                    id: streamMessage.message.id,
                    senderId: record.senderId,
                    receiverId: record.receiverId,
                    content: record.content,
                    read: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }
            catch (error) {
                console.error("Error creating message:", error);
                throw error;
            }
        });
    }
    getAllMessagesByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId) {
                    throw new Error("User ID is required");
                }
                // Get all channels the user is a member of
                const channels = yield stream_service_1.default.queryUserChannels(userId);
                // Get messages from all channels
                const messages = [];
                for (const channel of channels) {
                    if (!channel.id)
                        continue;
                    const channelMessages = yield stream_service_1.default.getChannelMessages(channel.id);
                    for (const msg of channelMessages) {
                        if (msg.id && msg.user_id && msg.text) {
                            const otherMember = channel.state.members[userId] ?
                                Object.keys(channel.state.members).find(id => id !== userId) :
                                undefined;
                            if (otherMember) {
                                messages.push({
                                    id: msg.id,
                                    senderId: msg.user_id,
                                    receiverId: otherMember,
                                    content: msg.text,
                                    read: false,
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                });
                            }
                        }
                    }
                }
                return messages;
            }
            catch (error) {
                console.error("Error getting messages:", error);
                throw error;
            }
        });
    }
    getConversation(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!senderId || !receiverId) {
                    throw new Error("Both sender and receiver IDs are required");
                }
                // Get or create channel for the conversation
                const channel = yield stream_service_1.default.getOrCreateUserChannel(senderId, receiverId);
                if (!channel || !channel.id) {
                    throw new Error("Failed to create or get channel");
                }
                // Get messages from the channel
                const messages = yield stream_service_1.default.getChannelMessages(channel.id);
                // Map Stream messages to our interface
                return messages
                    .filter(msg => msg.id && msg.user_id && msg.text)
                    .map(msg => ({
                    id: msg.id,
                    senderId: msg.user_id,
                    receiverId: msg.user_id === senderId ? receiverId : senderId,
                    content: msg.text,
                    read: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }));
            }
            catch (error) {
                console.error("Error getting conversation:", error);
                throw error;
            }
        });
    }
    markMessageAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Stream handles read receipts automatically
            return;
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
