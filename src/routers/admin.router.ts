import { Router, Request, Response, NextFunction } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/role.middleware";

const router = Router();
const adminController = new AdminController();

// Get all pending doctor verifications
router.get(
  "/doctor-verifications/pending",
  authenticateToken,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminController.getPendingDoctorVerifications(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get doctor verification details
router.get(
  "/doctor-verifications/:doctorId",
  authenticateToken,
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
  authenticateToken,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminController.verifyDoctor(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router; 