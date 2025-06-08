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
    try {
      const { appointmentId } = req.body;
      const doctorId = (req as any).user?.id;

      if (!appointmentId || !doctorId) {
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

      const timeSlot = (appointment as any).timeSlot;
      if (!timeSlot) {
        return Utility.handleError(res, "Time slot not found", ResponseCode.NOT_FOUND);
      }

      // Create Stream channel for the call
      const channel = await streamService.createAppointmentChannel(
        appointmentId,
        doctorId,
        appointment.patientId,
        timeSlot.startTime
      );

      if (!channel || !channel.id) {
        return Utility.handleError(res, "Failed to create call channel", ResponseCode.SERVER_ERROR);
      }

      // Create call record
      const call = await this.callService.createCall({
        appointmentId,
        doctorId,
        patientId: appointment.patientId,
        status: "ACTIVE",
        streamCallId: channel.id,
      });

      return Utility.handleSuccess(res, "Call initiated successfully", { call }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as Error).message);
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
      const { id } = req.params;
      const call = await this.callService.getCallById(id);
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
      const { id } = req.params;
      const call = await this.callService.getCallById(id);
      
      if (!call) {
        return Utility.handleError(res, "Call not found", ResponseCode.NOT_FOUND);
      }

      // Update call status
      const updatedCall = await this.callService.updateCall(id, { status: "COMPLETED" });
      
      return Utility.handleSuccess(res, "Call ended successfully", { call: updatedCall }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as Error).message);
    }
  };

  deleteCall = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const call = await this.callService.getCallById(id);
      
      if (!call) {
        return Utility.handleError(res, "Call not found", ResponseCode.NOT_FOUND);
      }

      await this.callService.deleteCall(id);
      return Utility.handleSuccess(res, "Call deleted successfully", {}, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as Error).message);
    }
  };
}

export default CallController;