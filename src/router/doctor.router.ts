import express, { Request, Response } from "express";
import DoctorController from "../controllers/doctor.controller";
import {
  Auth,
  DoctorMiddleware,
  validator,
} from "../middlewares/index.middlewares";
import validationSchema from "../validators/doctor.validator.schema";

const createDoctorRoute = () => {
  const router = express.Router();
  const doctorController = new DoctorController();

  router.post(
    "/create",
    validator(validationSchema.doctorValidationSchema),
    Auth(),
    (req: Request, res: Response) => {
      return doctorController.registerDoctor(req, res);
    }
  );

  router.get("/all-doctor", Auth(), (req: Request, res: Response) => {
    return doctorController.getAllDoctors(req, res);
  });

  router.post(
    "/create-time-slot",
    validator(validationSchema.timeSlotSchema),
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      return doctorController.createTimeSlot(req, res);
    }
  );

  router.get("/all-time-slot", Auth(), (req: Request, res: Response) => {
    return doctorController.getAllTimeSlots(req, res);
  });

  router.put(
    "/cancel/:id",
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      doctorController.cancelAppointment(req, res);
    }
  );

  router.put(
    "/approve/:id",
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      doctorController.approveAppointment(req, res);
    }
  );

  return router;
};

export default createDoctorRoute();
