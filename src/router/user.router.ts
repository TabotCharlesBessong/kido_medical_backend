import express, { Request, Response, NextFunction } from "express";
import UserController from "../controllers/user.controller";
import { Auth, validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/user.validator.schema";

const createUserRoute = () => {
  const router = express.Router();
  const userController = new UserController();

  router.post(
    "/register",
    validator(validationSchema.registrationSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await userController.register(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/login",
    validator(validationSchema.loginSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await userController.login(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/forgot-password",
    validator(validationSchema.forgotPasswordSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await userController.forgotPassword(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/reset-password",
    validator(validationSchema.resetPasswordSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await userController.resetPassword(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/verify-account",
    validator(validationSchema.verifyAccountSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await userController.verifyAccount(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post("/logout", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await userController.logout(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get("/users/all", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await userController.getAllUsers(req, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createUserRoute();
