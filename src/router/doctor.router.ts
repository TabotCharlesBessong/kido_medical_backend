import express, { Request, Response } from "express";
import UserService from "../services/user.services";
import UserDataSource from "../datasources/user.datasource";
import DoctorService from "../services/doctor.service";
import DoctorDataSource from "../datasources/doctor.datasource";
import DoctorController from "../controllers/doctor.controller";
import validationSchema from "../validators/doctor.validator.schema";
import { Auth, DoctorMiddleware, validator } from "../middlewares/index.middlewares";
import TimeSlotService from "../services/timeslot.service";
import TimeSlotDataSource from "../datasources/timeslot.datasource";

const createDoctorRoute = () => {
  const router = express.Router();
  const userService = new UserService(new UserDataSource());
  const doctorService = new DoctorService(new DoctorDataSource());
  const timeSlotService = new TimeSlotService(new TimeSlotDataSource());
  const doctorController = new DoctorController(
    doctorService,
    userService,
    timeSlotService
  );

  router.post(
    "/create",
    validator(validationSchema.doctorValidationSchema),
    Auth(),
    (req: Request, res: Response) => {
      return doctorController.registerDoctor(req, res);
    }
  );

  router.post("/create-time-slot",validator(validationSchema.timeSlotSchema),DoctorMiddleware(),(req:Request,res:Response) => {
    return doctorController.createTimeSlot(req,res)
  })

  return router;
};

export default createDoctorRoute();
