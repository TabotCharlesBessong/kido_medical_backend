import express, { Request, Response } from "express";
import UserService from "../services/user.services";
import UserDataSource from "../datasources/user.datasource";
import DoctorService from "../services/doctor.service";
import DoctorDataSource from "../datasources/doctor.datasource";
import DoctorController from "../controllers/doctor.controller";
import validationSchema from "../validators/doctor.validator.schema";
import {
  Auth,
  DoctorMiddleware,
  validator,
} from "../middlewares/index.middlewares";
import TimeSlotService from "../services/timeslot.service";
import TimeSlotDataSource from "../datasources/timeslot.datasource";
import AppointmentDataSource from "../datasources/appointment.datasource";
import AppointmentService from "../services/appointment.service";
import NotificationDataSource from "../datasources/notification.datasource";

const createDoctorRoute = () => {
  const router = express.Router();
  const userService = new UserService(new UserDataSource());
  const doctorService = new DoctorService(new DoctorDataSource());
  const appointmentService = new AppointmentService(
    new AppointmentDataSource(),
    new NotificationDataSource()
  );
  const timeSlotService = new TimeSlotService(new TimeSlotDataSource());
  const doctorController = new DoctorController(
    doctorService,
    userService,
    timeSlotService,
    appointmentService
  );

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
    "/cancel/:appointmentId",
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      doctorController.approveAppointment(req, res);
    }
  );

  router.put(
    "/approve/:appointmentId",
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      doctorController.approveAppointment(req, res);
    }
  );

  return router;
};

export default createDoctorRoute();
