import express, { Request, Response, NextFunction } from "express";
import CallController from "../controllers/call.controller";
import { DoctorMiddleware, Auth } from "../middlewares/index.middlewares";

const createCallRoute = () => {
  const router = express.Router();
  const callController = new CallController();

  // Create a new call
  router.post("/create", DoctorMiddleware(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await callController.callPatient(req, res);
    } catch (error) {
      next(error);
    }
  });

  // End a call
  router.post("/:callId/end", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await callController.endCall(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Get all calls
  router.get("/", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await callController.getAllCalls(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Get call by ID
  router.get("/:callId", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await callController.getCallById(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Delete a call
  router.delete("/:callId", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await callController.deleteCall(req, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createCallRoute();
