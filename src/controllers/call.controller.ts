import { Request, Response } from "express";
import { ResponseCode } from "../interfaces/enum/code.enum";
import CallService from "../services/call.service";
import streamService from "../services/stream.service";
import Utility from "../utils/index.utils";
import AppointmentModel from "../models/appointment.model";
import TimeSlotModel from "../models/timeslot.model";

class CallController {
  private callService: CallService;

  constructor() {
    this.callService = new CallService();
  }

  callPatient = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId || !userRole) {
      return Utility.handleError(res, "Unauthorized access", ResponseCode.UNAUTHORIZED);
    }

    try {
      const { appointmentId } = req.body;
      
      if (!appointmentId) {
        return Utility.handleError(res, "Missing required fields", ResponseCode.BAD_REQUEST);
      }

      // Get appointment and time slot
      const appointment = await AppointmentModel.findByPk(appointmentId, {
        include: [{
          model: TimeSlotModel,
          as: 'timeSlot'
        }],
      });

      if (!appointment) {
        return Utility.handleError(res, "Appointment not found", ResponseCode.NOT_FOUND);
      }

      if (appointment.status !== "CONFIRMED") {
        return Utility.handleError(res, "Appointment must be confirmed to start a call", ResponseCode.BAD_REQUEST);
      }

      const timeSlot = (appointment as any).timeSlot;
      if (!timeSlot) {
        return Utility.handleError(res, "Time slot not found", ResponseCode.NOT_FOUND);
      }

      // Verify user is the doctor for this appointment
      if (appointment.doctorId !== userId) {
        return Utility.handleError(res, "Only the assigned doctor can initiate this call", ResponseCode.UNAUTHORIZED);
      }

      // Create Stream channel for the call
      const channel = await streamService.createCallChannel(
        appointmentId,
        userId,
        appointment.patientId,
        timeSlot.startTime
      );

      if (!channel || !channel.id) {
        return Utility.handleError(res, "Failed to create call channel", ResponseCode.SERVER_ERROR);
      }

      // Create or update call record
      const existingCall = await this.callService.getCallByAppointmentId(appointmentId);
      let call;

      if (existingCall) {
        // If call exists but is completed/failed, create a new one
        if (existingCall.status === "COMPLETED" || existingCall.status === "FAILED") {
          call = await this.callService.createCall({
            appointmentId,
            doctorId: userId,
            patientId: appointment.patientId,
            status: "PENDING",
            streamCallId: channel.id
          });
        } else {
          call = await this.callService.updateCall(existingCall.id, {
            status: "PENDING",
            streamCallId: channel.id
          });
        }
      } else {
        call = await this.callService.createCall({
          appointmentId,
          doctorId: userId,
          patientId: appointment.patientId,
          status: "PENDING",
          streamCallId: channel.id
        });
      }

      // Generate Stream tokens for both users
      const doctorToken = await streamService.generateStreamToken(userId);
      const patientToken = await streamService.generateStreamToken(appointment.patientId);

      return Utility.handleSuccess(
        res,
        "Call initiated successfully",
        { 
          call,
          tokens: {
            doctor: doctorToken,
            patient: patientToken
          },
          channelId: channel.id,
          // For React Native Expo integration
          callConfig: {
            callId: call.id,
            channelId: channel.id,
            type: "video",
            members: [userId, appointment.patientId]
          }
        },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      console.error("Error initiating call:", error);
      return Utility.handleError(res, "Failed to initiate call", ResponseCode.SERVER_ERROR);
    }
  };

  getAllCalls = async (req: Request, res: Response) => {
    try {
      const calls = await this.callService.getCalls();
      return Utility.handleSuccess(res, "Calls retrieved successfully", { calls }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as Error).message);
    }
  };

  getCallById = async (req: Request, res: Response) => {
    try {
      const { callId } = req.params;
      const userId = (req as any).user?.id;
      
      const call = await this.callService.getCallById(callId);
      if (!call) {
        return Utility.handleError(res, "Call not found", ResponseCode.NOT_FOUND);
      }

      // Verify user is part of the call
      if (userId && call.doctorId !== userId && call.patientId !== userId) {
        return Utility.handleError(res, "Unauthorized to view this call", ResponseCode.UNAUTHORIZED);
      }

      // Get Stream token for the user if authenticated
      let streamToken = null;
      if (userId) {
        streamToken = await streamService.generateStreamToken(userId);
      }

      // Get channel info if available
      let channelInfo = null;
      if (call.streamCallId) {
        try {
          const channel = await streamService.getCallChannel(call.streamCallId);
          const channelData = channel.data as any;
          channelInfo = {
            id: channel.id,
            type: channel.type,
            members: Object.keys(channel.state?.members || {}),
            custom: channelData?.custom || {}
          };
        } catch (error) {
          console.warn("Could not fetch channel info:", error);
        }
      }

      return Utility.handleSuccess(
        res, 
        "Call retrieved successfully", 
        { 
          call,
          streamToken,
          channelInfo
        }, 
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(res, (error as Error).message);
    }
  };

  endCall = async (req: Request, res: Response) => {
    try {
      const { callId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return Utility.handleError(res, "Unauthorized access", ResponseCode.UNAUTHORIZED);
      }

      const call = await this.callService.getCallById(callId);
      if (!call) {
        return Utility.handleError(res, "Call not found", ResponseCode.NOT_FOUND);
      }

      // Verify user is part of the call
      if (call.doctorId !== userId && call.patientId !== userId) {
        return Utility.handleError(res, "Unauthorized to end this call", ResponseCode.UNAUTHORIZED);
      }

      // End the Stream channel if it exists
      if (call.streamCallId) {
        await streamService.endCallChannel(call.streamCallId);
      }

      // Update call status
      const updatedCall = await this.callService.updateCall(callId, {
        status: "COMPLETED",
        updatedAt: new Date()
      });

      return Utility.handleSuccess(
        res,
        "Call ended successfully",
        { call: updatedCall },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      console.error("Error ending call:", error);
      return Utility.handleError(res, "Failed to end call", ResponseCode.SERVER_ERROR);
    }
  };

  deleteCall = async (req: Request, res: Response) => {
    try {
      const { callId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return Utility.handleError(res, "Unauthorized access", ResponseCode.UNAUTHORIZED);
      }

      const call = await this.callService.getCallById(callId);
      if (!call) {
        return Utility.handleError(res, "Call not found", ResponseCode.NOT_FOUND);
      }

      // Verify user is part of the call
      if (call.doctorId !== userId && call.patientId !== userId) {
        return Utility.handleError(res, "Unauthorized to delete this call", ResponseCode.UNAUTHORIZED);
      }

      // End the Stream channel if it exists
      if (call.streamCallId) {
        try {
          await streamService.endCallChannel(call.streamCallId);
        } catch (error) {
          console.warn("Error ending Stream channel:", error);
          // Continue with deletion even if Stream channel fails
        }
      }

      await this.callService.deleteCall(callId);
      return Utility.handleSuccess(res, "Call deleted successfully", {}, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as Error).message);
    }
  };

  // Get Stream token for authenticated user (for mobile clients)
  getStreamToken = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return Utility.handleError(res, "Unauthorized access", ResponseCode.UNAUTHORIZED);
      }

      // Ensure user exists in Stream
      const user = await (req as any).user;
      await streamService.upsertStreamUser({
        id: userId,
        name: user.name || user.email || userId,
        image: user.image || user.profilePicture
      });

      // Generate token
      const token = await streamService.generateStreamToken(userId);

      return Utility.handleSuccess(
        res,
        "Token generated successfully",
        { 
          token,
          userId,
          apiKey: process.env.STREAM_API_KEY
        },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      console.error("Error generating Stream token:", error);
      return Utility.handleError(res, "Failed to generate token", ResponseCode.SERVER_ERROR);
    }
  };

  // Join a call (for mobile clients)
  joinCall = async (req: Request, res: Response) => {
    try {
      const { callId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return Utility.handleError(res, "Unauthorized access", ResponseCode.UNAUTHORIZED);
      }

      const call = await this.callService.getCallById(callId);
      if (!call) {
        return Utility.handleError(res, "Call not found", ResponseCode.NOT_FOUND);
      }

      // Verify user is part of the call
      if (call.doctorId !== userId && call.patientId !== userId) {
        return Utility.handleError(res, "Unauthorized to join this call", ResponseCode.UNAUTHORIZED);
      }

      // Update call status to ACTIVE
      await this.callService.updateCallStatus(callId, "ACTIVE");

      // Get Stream token
      const token = await streamService.generateStreamToken(userId);

      // Get channel info
      let channelInfo = null;
      if (call.streamCallId) {
        try {
          const channel = await streamService.getCallChannel(call.streamCallId);
          const channelData = channel.data as any;
          channelInfo = {
            id: channel.id,
            type: channel.type,
            members: Object.keys(channel.state?.members || {}),
            custom: channelData?.custom || {}
          };
        } catch (error) {
          console.warn("Could not fetch channel info:", error);
        }
      }

      return Utility.handleSuccess(
        res,
        "Call joined successfully",
        {
          call,
          token,
          channelInfo,
          callConfig: {
            callId: call.id,
            channelId: call.streamCallId,
            type: "video",
            members: [call.doctorId, call.patientId]
          }
        },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      console.error("Error joining call:", error);
      return Utility.handleError(res, "Failed to join call", ResponseCode.SERVER_ERROR);
    }
  };
}

export default CallController;