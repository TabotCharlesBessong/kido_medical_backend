import { Request, Response } from "express";
import { ResponseCode } from "../interfaces/enum/code.enum";
import CallService from "../services/call.service"
import Utility from "../utils/index.utils";

class CallController {
  private callService: CallService;

  constructor() {
    this.callService = new CallService();
  }

  async callPatient(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newCall = {
        doctorId: params.user.id,
        patientId: params.patientId,
        appointmentId: params.appointmentId,
        status: "PENDING",
      };
      const call = await this.callService.createCall(newCall);
      return Utility.handleSuccess(
        res,
        "Call started successfully",
        { call },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getAllCalls(req: Request, res: Response) {
    try {
      const calls = await this.callService.getCalls();
      return Utility.handleSuccess(
        res,
        "Calls retrieved successfully",
        { calls },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async deleteCall(req: Request, res: Response) {
    try {
      const callId = req.params.callId;
      await this.callService.deleteCall(callId);
      return Utility.handleSuccess(
        res,
        "Call deleted successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getCallById(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const call = await this.callService.getCallById(postId);
      if (!call) {
        return Utility.handleError(
          res,
          "Call not found",
          ResponseCode.NOT_FOUND
        );
      }
      return Utility.handleSuccess(
        res,
        "Call retrieved successfully",
        { call },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }
}

export default CallController