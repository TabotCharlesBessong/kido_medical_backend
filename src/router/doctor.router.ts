import express, { Request, Response, NextFunction } from "express";
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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.registerDoctor(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/:userId", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await doctorController.getDoctorById(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get("/doctor/all", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await doctorController.getAllDoctors(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/create-time-slot",
    validator(validationSchema.timeSlotSchema),
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.createTimeSlot(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/time/all", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await doctorController.getAllTimeSlots(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.put(
    "/cancel/:id",
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.cancelAppointment(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/approve/:id",
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.approveAppointment(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/record/sign",
    DoctorMiddleware(),
    validator(validationSchema.vitalSignSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.createVitalSing(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/record/sign/all",
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.getAllVitals(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/record/sign/:vitalId", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await doctorController.getVitalsById(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.put(
    "/record/sign/:vitalId",
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.updateVitals(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/record/sign/:vitalId",
    Auth(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.destroyVitals(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/record/consultation",
    DoctorMiddleware(),
    validator(validationSchema.consultationSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.createConsultation(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/record/consultation/all",
    Auth(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.getAllConsultations(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/record/consultation/:consultationId",
    Auth(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.getConsultationById(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/record/consultation/:consultationId",
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.updateConsultation(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/record/consultation/:consultationId",
    Auth(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.destroyConsultation(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/record/prescription",
    DoctorMiddleware(),
    validator(validationSchema.PrescriptionSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.createPrescription(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/record/prescription/all",
    Auth(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.getPrescriptions(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/record/prescription/:id",
    Auth(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.getPrescriptionById(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    "/record/prescription/:id",
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.updatePrescription(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/record/prescription/:prescriptionId",
    Auth(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await doctorController.destroyPrescription(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export default createDoctorRoute();
