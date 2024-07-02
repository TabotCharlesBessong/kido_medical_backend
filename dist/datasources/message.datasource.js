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
const sequelize_1 = require("sequelize");
const message_model_1 = __importDefault(require("../models/message.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
class MessageDataSource {
    create(record) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_model_1.default.create(record);
        });
    }
    fetchAllByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_model_1.default.findAll({
                where: { [sequelize_1.Op.or]: [{ senderId: userId }, { receiverId: userId }] },
                include: [
                    { model: user_model_1.default, as: "sender" },
                    { model: user_model_1.default, as: "receiver" },
                ],
            });
        });
    }
    fetchConversation(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId },
                    ],
                },
                include: [
                    { model: user_model_1.default, as: "sender" },
                    { model: user_model_1.default, as: "receiver" },
                ],
            });
        });
    }
    markAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield message_model_1.default.update({ read: true }, { where: { id: messageId } });
        });
    }
}
exports.default = MessageDataSource;
