import { Request, Response } from "express";
import AdminService from "../services/admin.service";
import { ResponseCode } from "../interfaces/enum/code.enum";
import Utility from "../utils/index.utils";
import { DoctorVerificationStatus } from "../interfaces/enum/doctor.enum";

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async getPendingDoctorVerifications(req: Request, res: Response) {
    try {
      const pendingDoctors = await this.adminService.getPendingDoctorVerifications();
      return Utility.handleSuccess(
        res,
        "Pending doctor verifications fetched successfully",
        { doctors: pendingDoctors },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as Error).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getPendingKycVerifications(req: Request, res: Response) {
    try {
      const pendingKycRequests = await this.adminService.getPendingKycVerifications();
      return Utility.handleSuccess(
        res,
        "Pending KYC verifications fetched successfully",
        { kycRequests: pendingKycRequests },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as Error).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async verifyDoctor(req: Request, res: Response) {
    try {
      const { email } = req.query;
      const { status, notes } = req.body;

      if (!email || typeof email !== 'string') {
        return Utility.handleError(
          res,
          "Doctor email is required",
          ResponseCode.BAD_REQUEST
        );
      }

      if (!status || !Object.values(DoctorVerificationStatus).includes(status)) {
        return Utility.handleError(
          res,
          "Invalid verification status",
          ResponseCode.BAD_REQUEST
        );
      }

      if (status === DoctorVerificationStatus.REJECTED && !notes) {
        return Utility.handleError(
          res,
          "Rejection reason is required",
          ResponseCode.BAD_REQUEST
        );
      }

      const doctor = await this.adminService.verifyDoctor(email, status, notes);
      return Utility.handleSuccess(
        res,
        `Doctor verification ${status.toLowerCase()} successfully`,
        { doctor },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as Error).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async verifyKyc(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status, reason } = req.body;

      if (!userId) {
        return Utility.handleError(
          res,
          "User ID is required",
          ResponseCode.BAD_REQUEST
        );
      }

      if (!status || !['approved', 'rejected'].includes(status)) {
        return Utility.handleError(
          res,
          "Invalid KYC status. Must be 'approved' or 'rejected'",
          ResponseCode.BAD_REQUEST
        );
      }

      if (status === 'rejected' && !reason) {
        return Utility.handleError(
          res,
          "Rejection reason is required",
          ResponseCode.BAD_REQUEST
        );
      }

      const kycVerification = await this.adminService.verifyKyc(userId, status, reason);
      return Utility.handleSuccess(
        res,
        `KYC verification ${status} successfully`,
        { kycVerification },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as Error).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getDoctorVerificationDetails(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      const doctorDetails = await this.adminService.getDoctorVerificationDetails(doctorId);
      return Utility.handleSuccess(
        res,
        "Doctor verification details fetched successfully",
        { doctor: doctorDetails },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as Error).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }
} 