import { StreamChat } from 'stream-chat';
import 'dotenv/config';

const apiKey = process.env.STREAM_API_KEY || '';
const apiSecret = process.env.STREAM_API_SECRET || '';

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export class StreamService {
  private serverClient: typeof streamClient;

  constructor() {
    this.serverClient = streamClient;
  }

  async upsertStreamUser(userData: { id: string; name: string; image?: string }) {
    try {
      await this.serverClient.upsertUsers([userData]);
      return userData;
    } catch (error) {
      console.error("Error upserting Stream user:", error);
      throw error;
    }
  }

  async generateStreamToken(userId: string) {
    try {
      const userIdStr = userId.toString();
      return this.serverClient.createToken(userIdStr);
    } catch (error) {
      console.error("Error generating Stream token:", error);
      throw error;
    }
  }

  async createAppointmentChannel(
    appointmentId: string,
    doctorId: string,
    patientId: string,
    startTime: Date
  ) {
    try {
      const channelId = `appointment-${appointmentId}`;
      const channel = this.serverClient.channel("messaging", channelId, {
        members: [doctorId, patientId],
        created_by_id: doctorId,
      });

      await channel.create();
      return channel;
    } catch (error) {
      console.error("Error creating appointment channel:", error);
      throw error;
    }
  }

  async getChannelMessages(channelId: string) {
    try {
      const channel = this.serverClient.channel('messaging', channelId);
      const response = await channel.query();
      return response.messages;
    } catch (error) {
      console.error('Error getting channel messages:', error);
      throw error;
    }
  }

  async sendMessage(channelId: string, userId: string, text: string) {
    try {
      const channel = this.serverClient.channel('messaging', channelId);
      const message = await channel.sendMessage({
        text,
        user_id: userId
      });
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getOrCreateUserChannel(userId1: string, userId2: string) {
    try {
      const channelId = [userId1, userId2].sort().join("-");
      const channel = this.serverClient.channel("messaging", channelId, {
        members: [userId1, userId2],
        created_by_id: userId1,
      });

      await channel.create();
      return channel;
    } catch (error) {
      console.error("Error creating user channel:", error);
      throw error;
    }
  }

  async queryUserChannels(userId: string) {
    try {
      return await this.serverClient.queryChannels({
        members: { $in: [userId] },
      });
    } catch (error) {
      console.error("Error querying user channels:", error);
      throw error;
    }
  }

  async updateChannelMetadata(channelId: string, metadata: Record<string, any>) {
    try {
      const channel = this.serverClient.channel('messaging', channelId);
      await channel.update(metadata);
      return channel;
    } catch (error) {
      console.error('Error updating channel metadata:', error);
      throw error;
    }
  }

  // Call management methods
  async createCallChannel(appointmentId: string, doctorId: string, patientId: string, startTime: Date) {
    try {
      const channelId = `call-${appointmentId}`;
      const channel = this.serverClient.channel("messaging", channelId, {
        members: [doctorId, patientId],
        created_by_id: doctorId,
        appointment_id: appointmentId,
        call_status: "PENDING",
        start_time: startTime.toISOString(),
        channel_type: "call"
      } as any);

      await channel.create();
      return channel;
    } catch (error) {
      console.error("Error creating call channel:", error);
      throw new Error("Failed to create call channel");
    }
  }

  async setCallStatus(channelId: string, status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED') {
    try {
      const channel = this.serverClient.channel('messaging', channelId);
      const response = await channel.update({
        call_status: status,
        last_status_update: new Date().toISOString()
      } as any);

      // Send system message about status change
      await channel.sendMessage({
        text: `Call status changed to ${status}`,
        system: true
      } as any);

      return response;
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  }

  async endCallChannel(channelId: string) {
    try {
      const channel = this.serverClient.channel('messaging', channelId);
      
      // Update channel metadata
      await channel.update({
        call_status: 'COMPLETED',
        ended_at: new Date().toISOString()
      } as any);

      // Send system message
      await channel.sendMessage({
        text: 'Call has ended',
        system: true
      } as any);

      return channel;
    } catch (error) {
      console.error('Error ending call channel:', error);
      throw new Error('Failed to end call channel');
    }
  }
}

export default new StreamService();