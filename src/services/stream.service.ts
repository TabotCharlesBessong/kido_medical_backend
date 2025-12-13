import { StreamChat } from 'stream-chat';
import 'dotenv/config';

const apiKey = process.env.STREAM_API_KEY || '';
const apiSecret = process.env.STREAM_API_SECRET || '';

if (!apiKey || !apiSecret) {
  throw new Error("Stream API key or Secret is missing. Please set STREAM_API_KEY and STREAM_API_SECRET in your .env file");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export class StreamService {
  private serverClient: typeof streamClient;

  constructor() {
    this.serverClient = streamClient;
  }

  async upsertStreamUser(userData: { id: string; name: string; image?: string; role?: string }) {
    try {
      // Ensure user exists in Stream before creating channels
      await this.serverClient.upsertUsers([{
        id: userData.id,
        name: userData.name,
        image: userData.image,
        role: userData.role || 'user'
      }]);
      return userData;
    } catch (error) {
      console.error("Error upserting Stream user:", error);
      throw new Error(`Failed to upsert Stream user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStreamToken(userId: string, expiresIn?: number) {
    try {
      const userIdStr = userId.toString();
      // Create token with optional expiration (default 24 hours)
      const expirationTime = expiresIn || Math.floor(Date.now() / 1000) + 60 * 60 * 24;
      return this.serverClient.createToken(userIdStr, expirationTime);
    } catch (error) {
      console.error("Error generating Stream token:", error);
      throw new Error(`Failed to generate Stream token: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  async sendMessage(channelId: string, userId: string, text: string, attachments?: any[]) {
    try {
      // Ensure user exists
      await this.upsertStreamUser({ id: userId, name: userId });
      
      const channel = this.serverClient.channel('messaging', channelId);
      
      // Ensure channel is initialized
      try {
        await channel.watch();
      } catch (watchError: any) {
        // If channel doesn't exist, throw error
        if (watchError.code === 4) {
          throw new Error(`Channel ${channelId} does not exist`);
        }
      }
      
      const message = await channel.sendMessage({
        text,
        user_id: userId,
        attachments: attachments || []
      });
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOrCreateUserChannel(userId1: string, userId2: string) {
    try {
      // Ensure both users exist in Stream
      await this.upsertStreamUser({ id: userId1, name: userId1 });
      await this.upsertStreamUser({ id: userId2, name: userId2 });

      const channelId = [userId1, userId2].sort().join("-");
      
      // Try to get existing channel first
      const channel = this.serverClient.channel("messaging", channelId, {
        members: [userId1, userId2],
        created_by_id: userId1
      });
      
      try {
        // Try to watch the channel to see if it exists
        await channel.watch();
        return channel;
      } catch (watchError: any) {
        // If channel doesn't exist, create it
        if (watchError.code === 4 || watchError.message?.includes('not found')) {
          // Channel doesn't exist, create it
          await channel.create();
          return channel;
        }
        throw watchError;
      }
    } catch (error) {
      console.error("Error getting or creating user channel:", error);
      throw new Error(`Failed to get or create user channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Call management methods - Create a video call using Stream's call functionality
  async createCallChannel(appointmentId: string, doctorId: string, patientId: string, startTime: Date) {
    try {
      // Ensure both users exist in Stream
      await this.upsertStreamUser({ id: doctorId, name: doctorId });
      await this.upsertStreamUser({ id: patientId, name: patientId });

      const channelId = `call-${appointmentId}`;
      
      // Use 'livestream' type for video calls, or 'messaging' with call metadata
      // For React Native Expo, we'll use messaging channel with call metadata
      // The client SDK will handle the actual video call
      const channel = this.serverClient.channel("messaging", channelId, {
        members: [doctorId, patientId],
        created_by_id: doctorId,
        ...({
          custom: {
            appointment_id: appointmentId,
            call_status: "PENDING",
            start_time: startTime.toISOString(),
            channel_type: "video_call",
            call_type: "video" // Indicates this is a video call channel
          }
        } as any)
      });

      // Check if channel already exists
      try {
        await channel.watch();
        // Channel exists, update metadata
        await channel.update({
          ...({
            custom: {
              appointment_id: appointmentId,
              call_status: "PENDING",
              start_time: startTime.toISOString(),
              channel_type: "video_call",
              call_type: "video"
            }
          } as any)
        });
      } catch (watchError: any) {
        // Channel doesn't exist, create it
        if (watchError.code === 4 || watchError.message?.includes('not found')) {
          await channel.create();
        } else {
          throw watchError;
        }
      }

      return channel;
    } catch (error) {
      console.error("Error creating call channel:", error);
      throw new Error(`Failed to create call channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setCallStatus(channelId: string, status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED') {
    try {
      const channel = this.serverClient.channel('messaging', channelId);
      
      // Ensure channel is watched
      try {
        await channel.watch();
      } catch (watchError: any) {
        if (watchError.code === 4) {
          throw new Error(`Call channel ${channelId} does not exist`);
        }
        throw watchError;
      }

      // Update channel custom data
      const channelData = channel.data as any;
      const currentCustom = channelData?.custom || {};
      const response = await channel.update({
        ...({
          custom: {
            ...currentCustom,
            call_status: status,
            last_status_update: new Date().toISOString()
          }
        } as any)
      });

      // Send system message about status change (only for important status changes)
      if (status === 'ACTIVE' || status === 'COMPLETED' || status === 'FAILED') {
        try {
          await channel.sendMessage({
            text: `Call status changed to ${status}`,
            type: 'system'
          });
        } catch (msgError) {
          // Don't fail if system message fails
          console.warn('Failed to send system message:', msgError);
        }
      }

      return response;
    } catch (error) {
      console.error('Error updating call status:', error);
      throw new Error(`Failed to update call status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async endCallChannel(channelId: string) {
    try {
      const channel = this.serverClient.channel('messaging', channelId);
      
      // Ensure channel is watched
      try {
        await channel.watch();
      } catch (watchError: any) {
        if (watchError.code === 4) {
          throw new Error(`Call channel ${channelId} does not exist`);
        }
        throw watchError;
      }

      // Update channel custom data
      const channelData = channel.data as any;
      const currentCustom = channelData?.custom || {};
      await channel.update({
        ...({
          custom: {
            ...currentCustom,
            call_status: 'COMPLETED',
            ended_at: new Date().toISOString()
          }
        } as any)
      });

      // Send system message
      try {
        await channel.sendMessage({
          text: 'Call has ended',
          type: 'system'
        });
      } catch (msgError) {
        // Don't fail if system message fails
        console.warn('Failed to send system message:', msgError);
      }

      return channel;
    } catch (error) {
      console.error('Error ending call channel:', error);
      throw new Error(`Failed to end call channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get call channel by ID
  async getCallChannel(channelId: string) {
    try {
      const channel = this.serverClient.channel('messaging', channelId);
      await channel.watch();
      return channel;
    } catch (error) {
      console.error('Error getting call channel:', error);
      throw new Error(`Failed to get call channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user's call channels
  async getUserCallChannels(userId: string) {
    try {
      const channels = await this.serverClient.queryChannels({
        type: 'messaging',
        members: { $in: [userId] },
        ...({
          'custom.channel_type': 'video_call'
        } as any)
      });
      return channels;
    } catch (error) {
      console.error('Error getting user call channels:', error);
      throw new Error(`Failed to get user call channels: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new StreamService();