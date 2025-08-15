import express, { Request, Response, NextFunction } from "express";
import AuthController from "../controllers/auth.controller";
import { validator } from "../middlewares/index.middlewares";
import * as yup from "yup";

const createAuthRoute = () => {
  const router = express.Router();
  const authController = new AuthController();

  // Validation schema for account verification request
  const accountVerificationSchema = yup.object({
    email: yup.string().email("Invalid email format").required("Email is required"),
  });

  // Request account verification
  router.post(
    "/request-verification",
    validator(accountVerificationSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await authController.requestAccountVerification(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // Verify account with token
  router.get(
    "/verify/:token",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await authController.verifyAccount(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export default createAuthRoute(); 