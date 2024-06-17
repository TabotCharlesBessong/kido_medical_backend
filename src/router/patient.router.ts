import express, { Request, Response } from "express";
import PatientController from "../controllers/patient.controller";
import { Auth, validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/patient.validator";
import PatientService from "../services/patient.service";
import UserDataSource from "../datasources/user.datasource";
import PatientDataSource from "../datasources/patient.datasource";

const createPatientRoute = () => {
  const router = express.Router();
  const patientService = new PatientService(new PatientDataSource());
  const patientController = new PatientController(patientService);

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

  // router.post(
  //   "/:userId/appointments",
  //   validator(validationSchema.bookAppointmentSchema),
  //   (req: Request, res: Response) => {
  //     return patientController.bookAppointment(req, res);
  //   }
  // );

  return router;
};

export default createPatientRoute();
