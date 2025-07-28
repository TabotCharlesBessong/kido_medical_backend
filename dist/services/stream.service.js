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
exports.StreamService = void 0;
const stream_chat_1 = require("stream-chat");
require("dotenv/config");
const apiKey = process.env.STREAM_API_KEY || '';
const apiSecret = process.env.STREAM_API_SECRET || '';
if (!apiKey || !apiSecret) {
    console.error("Stream API key or Secret is missing");
}
const streamClient = stream_chat_1.StreamChat.getInstance(apiKey, apiSecret);
class StreamService {
    constructor() {
        this.serverClient = streamClient;
    }
    upsertStreamUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.serverClient.upsertUsers([userData]);
                return userData;
            }
            catch (error) {
                console.error("Error upserting Stream user:", error);
                throw error;
            }
        });
    }
    generateStreamToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userIdStr = userId.toString();
                return this.serverClient.createToken(userIdStr);
            }
            catch (error) {
                console.error("Error generating Stream token:", error);
                throw error;
            }
        });
    }
    createAppointmentChannel(appointmentId, doctorId, patientId, startTime) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channelId = `appointment-${appointmentId}`;
                const channel = this.serverClient.channel("messaging", channelId, {
                    members: [doctorId, patientId],
                    created_by_id: doctorId,
                });
                yield channel.create();
                return channel;
            }
            catch (error) {
                console.error("Error creating appointment channel:", error);
                throw error;
            }
        });
    }
    getChannelMessages(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = this.serverClient.channel('messaging', channelId);
                const response = yield channel.query();
                return response.messages;
            }
            catch (error) {
                console.error('Error getting channel messages:', error);
                throw error;
            }
        });
    }
    sendMessage(channelId, userId, text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = this.serverClient.channel('messaging', channelId);
                const message = yield channel.sendMessage({
                    text,
                    user_id: userId
                });
                return message;
            }
            catch (error) {
                console.error('Error sending message:', error);
                throw error;
            }
        });
    }
    getOrCreateUserChannel(userId1, userId2) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channelId = [userId1, userId2].sort().join("-");
                const channel = this.serverClient.channel("messaging", channelId, {
                    members: [userId1, userId2],
                    created_by_id: userId1,
                });
                yield channel.create();
                return channel;
            }
            catch (error) {
                console.error("Error creating user channel:", error);
                throw error;
            }
        });
    }
    queryUserChannels(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.serverClient.queryChannels({
                    members: { $in: [userId] },
                });
            }
            catch (error) {
                console.error("Error querying user channels:", error);
                throw error;
            }
        });
    }
    updateChannelMetadata(channelId, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = this.serverClient.channel('messaging', channelId);
                yield channel.update(metadata);
                return channel;
            }
            catch (error) {
                console.error('Error updating channel metadata:', error);
                throw error;
            }
        });
    }
    // Call management methods
    createCallChannel(appointmentId, doctorId, patientId, startTime) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channelId = `call-${appointmentId}`;
                const channel = this.serverClient.channel("messaging", channelId, {
                    members: [doctorId, patientId],
                    created_by_id: doctorId,
                    appointment_id: appointmentId,
                    call_status: "PENDING",
                    start_time: startTime.toISOString(),
                    channel_type: "call"
                });
                yield channel.create();
                return channel;
            }
            catch (error) {
                console.error("Error creating call channel:", error);
                throw new Error("Failed to create call channel");
            }
        });
    }
    setCallStatus(channelId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = this.serverClient.channel('messaging', channelId);
                const response = yield channel.update({
                    call_status: status,
                    last_status_update: new Date().toISOString()
                });
                // Send system message about status change
                yield channel.sendMessage({
                    text: `Call status changed to ${status}`,
                    system: true
                });
                return response;
            }
            catch (error) {
                console.error('Error updating call status:', error);
                throw error;
            }
        });
    }
    endCallChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = this.serverClient.channel('messaging', channelId);
                // Update channel metadata
                yield channel.update({
                    call_status: 'COMPLETED',
                    ended_at: new Date().toISOString()
                });
                // Send system message
                yield channel.sendMessage({
                    text: 'Call has ended',
                    system: true
                });
                return channel;
            }
            catch (error) {
                console.error('Error ending call channel:', error);
                throw new Error('Failed to end call channel');
            }
        });
    }
}
exports.StreamService = StreamService;
exports.default = new StreamService();
