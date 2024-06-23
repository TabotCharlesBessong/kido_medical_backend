import express, { Request, Response } from "express";
import PatientController from "../controllers/patient.controller";
import { Auth, validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/patient.validator.schema";

const createPatientRoute = () => {
  const router = express.Router();
  const patientController = new PatientController();

  router.post(
    "/create",
    Auth(),
    validator(validationSchema.createPatientSchema),
    (req: Request, res: Response) => {
      return patientController.createPatient(req, res);
    }
  );

  router.get("/:userId", Auth(), (req: Request, res: Response) => {
    return patientController.getPatientById(req, res);
  });

  router.put(
    "/:userId",
    Auth(),
    // validator(validationSchema.createPatientSchema),
    (req: Request, res: Response) => {
      return patientController.updatePatient(req, res);
    }
  );

  router.post(
    "/appointment/create",
    Auth(),
    validator(validationSchema.bookAppointmentSchema),
    (req: Request, res: Response) => {
      return patientController.bookAppointment(req, res);
    }
  );

  router.put(
    "/appointment/:appointmentId",
    Auth(),
    validator(validationSchema.bookAppointmentSchema),
    (req: Request, res: Response) => {
      return patientController.updateAppointment(req, res);
    }
  );

  router.get("/appointment/all", Auth(), (req: Request, res: Response) => {
    return patientController.getAllAppointments(req, res);
  });

  router.get(
    "/appointment/:appointmentId",
    Auth(),
    (req: Request, res: Response) => {
      return patientController.getAppointmentById(req, res);
    }
  );

  return router;
};

export default createPatientRoute();
