import express, { Request, Response } from "express";
import CallController from "../controllers/call.controller";
import { DoctorMiddleware } from "../middlewares/index.middlewares";

const createCallRoute = () => {
  const router = express.Router();
  const callController = new CallController();

  router.post("/create", DoctorMiddleware(), (req: Request, res: Response) => {
    return callController.callPatient(req, res);
  });
  return router;
};

export default createCallRoute();
