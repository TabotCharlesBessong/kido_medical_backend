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
    // Alias for createAppointmentChannel for clarity in call context
    return this.createAppointmentChannel(appointmentId, doctorId, patientId, startTime);
  }

  async setCallStatus(channelId: string, status: 'ACTIVE' | 'COMPLETED' | 'FAILED') {
    try {
      // Use the updateChannelMetadata method for custom fields
      return await this.updateChannelMetadata(channelId, { call_status: status });
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  }

  async endCallChannel(channelId: string) {
    return this.setCallStatus(channelId, 'COMPLETED');
  }
}

export default new StreamService(); 