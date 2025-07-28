"use strict";
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
    async upsertStreamUser(userData) {
        try {
            await this.serverClient.upsertUsers([userData]);
            return userData;
        }
        catch (error) {
            console.error("Error upserting Stream user:", error);
            throw error;
        }
    }
    async generateStreamToken(userId) {
        try {
            const userIdStr = userId.toString();
            return this.serverClient.createToken(userIdStr);
        }
        catch (error) {
            console.error("Error generating Stream token:", error);
            throw error;
        }
    }
    async createAppointmentChannel(appointmentId, doctorId, patientId, startTime) {
        try {
            const channelId = `appointment-${appointmentId}`;
            const channel = this.serverClient.channel("messaging", channelId, {
                members: [doctorId, patientId],
                created_by_id: doctorId,
            });
            await channel.create();
            return channel;
        }
        catch (error) {
            console.error("Error creating appointment channel:", error);
            throw error;
        }
    }
    async getChannelMessages(channelId) {
        try {
            const channel = this.serverClient.channel('messaging', channelId);
            const response = await channel.query();
            return response.messages;
        }
        catch (error) {
            console.error('Error getting channel messages:', error);
            throw error;
        }
    }
    async sendMessage(channelId, userId, text) {
        try {
            const channel = this.serverClient.channel('messaging', channelId);
            const message = await channel.sendMessage({
                text,
                user_id: userId
            });
            return message;
        }
        catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
    async getOrCreateUserChannel(userId1, userId2) {
        try {
            const channelId = [userId1, userId2].sort().join("-");
            const channel = this.serverClient.channel("messaging", channelId, {
                members: [userId1, userId2],
                created_by_id: userId1,
            });
            await channel.create();
            return channel;
        }
        catch (error) {
            console.error("Error creating user channel:", error);
            throw error;
        }
    }
    async queryUserChannels(userId) {
        try {
            return await this.serverClient.queryChannels({
                members: { $in: [userId] },
            });
        }
        catch (error) {
            console.error("Error querying user channels:", error);
            throw error;
        }
    }
    async updateChannelMetadata(channelId, metadata) {
        try {
            const channel = this.serverClient.channel('messaging', channelId);
            await channel.update(metadata);
            return channel;
        }
        catch (error) {
            console.error('Error updating channel metadata:', error);
            throw error;
        }
    }
    async createCallChannel(appointmentId, doctorId, patientId, startTime) {
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
            await channel.create();
            return channel;
        }
        catch (error) {
            console.error("Error creating call channel:", error);
            throw new Error("Failed to create call channel");
        }
    }
    async setCallStatus(channelId, status) {
        try {
            const channel = this.serverClient.channel('messaging', channelId);
            const response = await channel.update({
                call_status: status,
                last_status_update: new Date().toISOString()
            });
            await channel.sendMessage({
                text: `Call status changed to ${status}`,
                system: true
            });
            return response;
        }
        catch (error) {
            console.error('Error updating call status:', error);
            throw error;
        }
    }
    async endCallChannel(channelId) {
        try {
            const channel = this.serverClient.channel('messaging', channelId);
            await channel.update({
                call_status: 'COMPLETED',
                ended_at: new Date().toISOString()
            });
            await channel.sendMessage({
                text: 'Call has ended',
                system: true
            });
            return channel;
        }
        catch (error) {
            console.error('Error ending call channel:', error);
            throw new Error('Failed to end call channel');
        }
    }
}
exports.StreamService = StreamService;
exports.default = new StreamService();
