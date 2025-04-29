import express, { Request, Response, NextFunction } from "express";
import CallController from "../controllers/call.controller";
import { DoctorMiddleware } from "../middlewares/index.middlewares";

const createCallRoute = () => {
  const router = express.Router();
  const callController = new CallController();

  router.post("/create", DoctorMiddleware(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await callController.callPatient(req, res);
    } catch (error) {
      next(error);
    }
  });
  return router;
};

export default createCallRoute();
