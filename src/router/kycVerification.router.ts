import express, { Request, Response, NextFunction } from "express";
import { KycVerificationController } from "../controllers/kycverification.controller";
import {
  Auth,
  DoctorMiddleware,
  validator,
} from "../middlewares/index.middlewares";
import { kycVerificationSchema } from "../validators/kyc.validator.schema";
import UploadService from "../services/upload.service";
import { isAdmin } from "../middleware/role.middleware";

const createKycVerificationRoute = () => {
  const router = express.Router();
  const kycVerificationController = new KycVerificationController();

  router.post(
    "/create-kyc-verification-request",
    Auth(),
    DoctorMiddleware(),
    UploadService.getUploadMiddleware(),
    validator(kycVerificationSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await kycVerificationController.createKycVerificationRequest(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/get-kyc-verification/:userId",
    Auth(),
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await kycVerificationController.getKycVerificationByUserId(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/get-all-kyc-verifications",
    Auth(),
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await kycVerificationController.getAllKycVerificationRequests(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // only admins can access this route
  router.patch(
    "/update-kyc-verification/:userId",
    Auth(),
    isAdmin,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await kycVerificationController.approveKycVerificationRequest(req, res);
      } catch (error) {
        next(error);
      }
    }
  );
  return router;
};

export default createKycVerificationRoute();
