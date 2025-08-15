import express, { Request, Response, NextFunction } from "express";
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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await patientController.createPatient(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/:userId", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await patientController.getPatientById(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.put(
    "/:userId",
    Auth(),
    // validator(validationSchema.createPatientSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await patientController.updatePatient(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/appointment/create",
    Auth(),
    validator(validationSchema.bookAppointmentSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await patientController.bookAppointment(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/appointment/:appointmentId",
    Auth(),
    validator(validationSchema.bookAppointmentSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await patientController.updateAppointment(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/appointment/all", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await patientController.getAllAppointments(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get(
    "/appointment/:appointmentId",
    Auth(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await patientController.getAppointmentById(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/appointments/all", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await patientController.getAllAppointments(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get("/appointments", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await patientController.getPatientAppointments(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get("/prescriptions", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await patientController.getPatientPrescriptions(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get("/consultations", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await patientController.getPatientConsultations(req, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createPatientRoute();
