import { Router, Request, Response, NextFunction } from "express";
import { AdminController } from "../controllers/admin.controller";
import { Auth } from "../middlewares/index.middlewares";
import { isAdmin } from "../middleware/role.middleware";

const router = Router();
const adminController = new AdminController();

// Get all pending doctor verifications
router.get(
  "/doctor-verifications/pending",
  Auth(),
  isAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminController.getPendingDoctorVerifications(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get all pending KYC verifications
router.get(
  "/kyc-verifications/pending",
  Auth(),
  isAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminController.getPendingKycVerifications(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get doctor verification details
router.get(
  "/doctor-verifications/:doctorId",
  Auth(),
  isAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminController.getDoctorVerificationDetails(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Verify doctor (approve/reject)
router.post(
  "/doctor-verifications/verify",
  Auth(),
  isAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminController.verifyDoctor(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Verify KYC (approve/reject)
router.patch(
  "/kyc-verifications/:userId/verify",
  Auth(),
  isAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminController.verifyKyc(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router; 