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

  router.get("/:userId", Auth(), (req: Request, res: Response) => {
    return doctorController.getDoctorById(req, res);
  });

  router.get("/doctor/all", Auth(), (req: Request, res: Response) => {
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

  router.get("/time/all", Auth(), (req: Request, res: Response) => {
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

  router.post(
    "/record/sign",
    DoctorMiddleware(),
    validator(validationSchema.vitalSignSchema),
    (req: Request, res: Response) => {
      doctorController.createVitalSing(req, res);
    }
  );

  router.get(
    "/record/sign/all",
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      doctorController.getAllVitals(req, res);
    }
  );

  router.get("/record/sign/:vitalId", Auth(), (req: Request, res: Response) => {
    doctorController.getVitalsById(req, res);
  });

  router.put(
    "/record/sign/:vitalId",
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      doctorController.updateVitals(req, res);
    }
  );

  router.delete(
    "/record/sign/:vitalId",
    Auth(),
    (req: Request, res: Response) => {
      doctorController.destroyVitals(req, res);
    }
  );

  router.post(
    "/record/consultation",
    DoctorMiddleware(),
    validator(validationSchema.consultationSchema),
    (req: Request, res: Response) => {
      doctorController.createConsultation(req, res);
    }
  );

  router.get(
    "/record/consultation/all",
    Auth(),
    (req: Request, res: Response) => {
      doctorController.getAllConsultations(req, res);
    }
  );

  router.get(
    "/record/consultation/:consultationId",
    Auth(),
    (req: Request, res: Response) => {
      doctorController.getConsultationById(req, res);
    }
  );

  router.put(
    "/record/consultation/:consultationId",
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      doctorController.updateConsultation(req, res);
    }
  );

  router.delete(
    "/record/consultation/:consultationId",
    Auth(),
    (req: Request, res: Response) => {
      doctorController.destroyConsultation(req, res);
    }
  );

  router.post(
    "/record/prescription",
    DoctorMiddleware(),
    validator(validationSchema.PrescriptionSchema),
    (req: Request, res: Response) => {
      doctorController.createPrescription(req, res);
    }
  );

  router.get(
    "/record/prescription/all",
    Auth(),
    (req: Request, res: Response) => {
      doctorController.getPrescriptions(req, res);
    }
  );

  router.get(
    "/record/prescription/:id",
    Auth(),
    (req: Request, res: Response) => {
      doctorController.getPrescriptionById(req, res);
    }
  );

  router.put(
    "/record/prescription/:id",
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      doctorController.updatePrescription(req, res);
    }
  );

  router.delete(
    "/record/prescription/:prescriptionId",
    Auth(),
    (req: Request, res: Response) => {
      doctorController.destroyPrescription(req, res);
    }
  );

  return router;
};

export default createDoctorRoute();
