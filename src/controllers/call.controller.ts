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
        call = await this.callService.updateCall(existingCall.id, {
          status: "ACTIVE",
          streamCallId: channel.id
        });
      } else {
        call = await this.callService.createCall({
          appointmentId,
          doctorId: userId,
          patientId: appointment.patientId,
          status: "ACTIVE",
          streamCallId: channel.id
        });
      }

      // Generate Stream token for real-time communication
      const streamToken = await streamService.generateStreamToken(userId);

      return Utility.handleSuccess(
        res,
        "Call initiated successfully",
        { 
          call,
          streamToken,
          channelId: channel.id
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
      const call = await this.callService.getCallById(callId);
      if (!call) {
        return Utility.handleError(res, "Call not found", ResponseCode.NOT_FOUND);
      }
      return Utility.handleSuccess(res, "Call retrieved successfully", { call }, ResponseCode.SUCCESS);
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
      const call = await this.callService.getCallById(callId);
      if (!call) {
        return Utility.handleError(res, "Call not found", ResponseCode.NOT_FOUND);
      }
      await this.callService.deleteCall(callId);
      return Utility.handleSuccess(res, "Call deleted successfully", {}, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as Error).message);
    }
  };
}

export default CallController;