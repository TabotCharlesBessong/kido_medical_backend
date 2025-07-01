import { Request, Response, NextFunction } from "express";
import { KycVerificationService } from "../services/kycVerfication.service";
import { IKycVerificationCreationBody } from "../interfaces/kycverification.interface";
import { ResponseCode } from "../interfaces/enum/code.enum";
import Utility from "../utils/index.utils";
import UserService from "../services/user.services";
import KycVerificationDataSource from "../datasources/kycVerification.datasource";
import { IUploadService } from "../interfaces/services.interface";
import UploadService from "../services/upload.service";
import EmailService from "../services/email.service";

export class KycVerificationController {
  private kycVerificationService: KycVerificationService;
  private uploadService: IUploadService;
  private userService: UserService;
  private emailService: typeof EmailService;

  constructor() {
    const userService = new UserService();
    this.kycVerificationService = new KycVerificationService(
      new KycVerificationDataSource(),
      userService
    );
    this.uploadService = UploadService;
    this.userService = userService;
    this.emailService = EmailService;
  }

  async createKycVerificationRequest(req: Request, res: Response) {
    try {
      const body: IKycVerificationCreationBody = { ...req.body };
      const file = req.file;

      const userId = req.params.userId || req.body.userId;

      const request =
        await this.kycVerificationService.getKycVerificationByUserId(userId);

      if (request) {
        return Utility.handleError(
          res,
          "Kyc Verification request already exists, please wait for approval ",
          ResponseCode.BAD_REQUEST
        );
      }

      if (file) {
        const fileUrl = await this.uploadService.uploadFile(file);
        body.documentUrl = fileUrl;
      }

      const kycRequest =
        await this.kycVerificationService.kycVerificationRequest(body);
      return Utility.handleSuccess(
        res,
        "Kyc Verification request sent",
        { kycRequest },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return res
        .status(ResponseCode.SERVER_ERROR)
        .json((error as TypeError).message);
    }
  }

  async getKycVerificationByUserId(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const request =
        await this.kycVerificationService.getKycVerificationByUserId(userId);
      if (request !== null) {
        return Utility.handleSuccess(
          res,
          "Kyc Verification request found",
          { request },
          ResponseCode.SUCCESS
        );
      } else {
        return Utility.handleError(
          res,
          "Kyc Verification request not found",
          ResponseCode.NOT_FOUND
        );
      }
    } catch (error) {
      return res
        .status(ResponseCode.SERVER_ERROR)
        .json((error as TypeError).message);
    }
  }

  async approveKycVerificationRequest(req: Request, res: Response) {
    try {
      const searchBy = req.params.userId;
      const data: Partial<IKycVerificationCreationBody> = { ...req.body };

      await this.kycVerificationService.updateKycVerification(
        {
          where: { userId: searchBy },
        },
        data
      );

      // Send email notification to the user
      const user = await this.userService.getUserByField({ id: searchBy });
      if (user) {
        if (data.status === 'approved') {
          await this.emailService.sendKycApprovalEmail({
            doctorEmail: user.email,
            doctorName: `${user.firstname} ${user.lastname}`
          });
        } else if (data.status === 'rejected') {
          await this.emailService.sendKycRejectionEmail({
            doctorEmail: user.email,
            doctorName: `${user.firstname} ${user.lastname}`,
            reason: data.reason || 'No reason provided'
          });
        }
      }

      return Utility.handleSuccess(
        res,
        `Kyc Verification request ${data.status}`,
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return res
        .status(ResponseCode.SERVER_ERROR)
        .json((error as TypeError).message);
    }
  }

  async getAllKycVerificationRequests(req: Request, res: Response) {
    try {
      const requests =
        await this.kycVerificationService.getAllKycVerificationRequests();
      return Utility.handleSuccess(
        res,
        "All Kyc Verification requests fetched",
        { requests },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return res
        .status(ResponseCode.SERVER_ERROR)
        .json((error as TypeError).message);
    }
  }
}

export default KycVerificationController;
