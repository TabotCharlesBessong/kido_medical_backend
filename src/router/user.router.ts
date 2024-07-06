import express, { Request, Response } from "express";
import UserController from "../controllers/user.controller";
import { validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/user.validator.schema";
const createUserRoute = () => {
  const router = express.Router();
  const userController = new UserController();

  router.post(
    "/register",
    validator(validationSchema.registrationSchema),
    (req: Request, res: Response) => {
      return userController.register(req, res);
    }
  );

  router.post(
    "/login",
    validator(validationSchema.loginSchema),
    (req: Request, res: Response) => {
      return userController.login(req, res);
    }
  );

  router.post(
    "/forgot-password",
    validator(validationSchema.forgotPasswordSchema),
    (req: Request, res: Response) => {
      return userController.forgotPassword(req, res);
    }
  );

  router.post(
    "/reset-password",
    validator(validationSchema.resetPasswordSchema),
    (req: Request, res: Response) => {
      return userController.resetPassword(req, res);
    }
  );

  router.post(
    "/verify-account",
    validator(validationSchema.verifyAccountSchema),
    (req: Request, res: Response) => {
      return userController.verifyAccount(req, res);
    }
  );

  router.post("/logout", (req: Request, res: Response) => {
    return userController.logout(req, res);
  });

  return router;
};

export default createUserRoute();
