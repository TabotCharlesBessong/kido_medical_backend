hello

### Services (Continued)

#### services/doctor.service.ts (continued)
typescript
  async createDoctor(record: IDoctorCreationBody): Promise<IDoctor> {
    return this.doctorDataSource.create(record);
  }

  async getDoctorByUserId(userId: string): Promise<IDoctor | null> {
    const query = { where: { userId }, raw: true, returning: true };
    return this.doctorDataSource.fetchOne(query);
  }

  async updateDoctor(userId: string, data: Partial<IDoctor>): Promise<void> {
    const query = { where: { userId }, returning: true };
    await this.doctorDataSource.updateOne(query, data);
  }

  async createTimeSlot(userId: string, timeSlot: string): Promise<void> {
    // Logic to create time slot for doctor
  }

  async getAvailableTimeSlots(userId: string): Promise<string[]> {
    // Logic to get available time slots for doctor
    return [];
  }
}

export { DoctorDataSource, DoctorService };


#### services/patient.service.ts
typescript
import { IPatient, IPatientDataSource, IPatientCreationBody } from "../interfaces/patient.interface";
import PatientModel from "../models/patient.model";

class PatientDataSource implements IPatientDataSource {
  async create(record: IPatientCreationBody): Promise<IPatient> {
    return await PatientModel.create(record);
  }

  async fetchOne(query: IFindUserQuery): Promise<IPatient | null> {
    return await PatientModel.findOne(query);
  }

  async updateOne(searchBy: IFindUserQuery, data: Partial<IPatient>): Promise<void> {
    await PatientModel.update(data, searchBy);
  }
}

class PatientService {
  private patientDataSource: IPatientDataSource;

  constructor(patientDataSource: IPatientDataSource) {
    this.patientDataSource = patientDataSource;
  }

  async createPatient(record: IPatientCreationBody): Promise<IPatient> {
    return this.patientDataSource.create(record);
  }

  async getPatientByUserId(userId: string): Promise<IPatient | null> {
    const query = { where: { userId }, raw: true, returning: true };
    return this.patientDataSource.fetchOne(query);
  }

  async updatePatient(userId: string, data: Partial<IPatient>): Promise<void> {
    const query = { where: { userId }, returning: true };
    await this.patientDataSource.updateOne(query, data);
  }

  async bookAppointment(patientId: string, doctorId: string, timeSlot: string, date: string, reason: string): Promise<void> {
    // Logic to book an appointment with a doctor
  }

  async getAppointments(patientId: string): Promise<any[]> {
    // Logic to get all appointments for a patient
    return [];
  }
}

export { PatientDataSource, PatientService };


#### services/appointment.service.ts
typescript
import { IAppointment, IAppointmentDataSource, IAppointmentCreationBody } from "../interfaces/appointment.interface";
import AppointmentModel from "../models/appointment.model";

class AppointmentDataSource implements IAppointmentDataSource {
  async create(record: IAppointmentCreationBody): Promise<IAppointment> {
    return await AppointmentModel.create(record);
  }

  async fetchOne(query: IFindUserQuery): Promise<IAppointment | null> {
    return await AppointmentModel.findOne(query);
  }

  async updateOne(searchBy: IFindUserQuery, data: Partial<IAppointment>): Promise<void> {
    await AppointmentModel.update(data, searchBy);
  }
}

class AppointmentService {
  private appointmentDataSource: IAppointmentDataSource;

  constructor(appointmentDataSource: IAppointmentDataSource) {
    this.appointmentDataSource = appointmentDataSource;
  }

  async createAppointment(record: IAppointmentCreationBody): Promise<IAppointment> {
    return this.appointmentDataSource.create(record);
  }

  async getAppointmentById(appointmentId: string): Promise<IAppointment | null> {
    const query = { where: { id: appointmentId }, raw: true, returning: true };
    return this.appointmentDataSource.fetchOne(query);
  }

  async updateAppointment(appointmentId: string, data: Partial<IAppointment>): Promise<void> {
    const query = { where: { id: appointmentId }, returning: true };
    await this.appointmentDataSource.updateOne(query, data);
  }

  async getAppointmentsForDoctor(doctorId: string): Promise<IAppointment[]> {
    // Logic to get all appointments for a doctor
    return [];
  }

  async getAppointmentsForPatient(patientId: string): Promise<IAppointment[]> {
    // Logic to get all appointments for a patient
    return [];
  }
}

export { AppointmentDataSource, AppointmentService };


### Controllers

#### controllers/doctor.controller.ts
typescript
import { Request, Response } from "express";
import { DoctorService } from "../services/doctor.service";
import { UserService } from "../services/user.service";

class DoctorController {
  private doctorService: DoctorService;
  private userService: UserService;

  constructor(doctorService: DoctorService, userService: UserService) {
    this.doctorService = doctorService;
    this.userService = userService;
  }

  async registerDoctor(req: Request, res: Response) {
    try {
      const userId = req.body.userId;
      const { specialization } = req.body;
      const doctorRecord = {
        userId,
        specialization,
      };
      const doctor = await this.doctorService.createDoctor(doctorRecord);
      return res.status(201).json({ doctor });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async createTimeSlot(req: Request, res: Response) {
    try {
      const { userId, timeSlot } = req.body;
      await this.doctorService.createTimeSlot(userId, timeSlot);
      return res.status(200).json({ message: "Time slot created successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getAvailableTimeSlots(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const timeSlots = await this.doctorService.getAvailableTimeSlots(userId);
      return res.status(200).json({ timeSlots });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }
}

export default DoctorController;


#### controllers/patient.controller.ts
typescript
import { Request, Response } from "express";
import { PatientService } from "../services/patient.service";

class PatientController {
  private patientService: PatientService;

  constructor(patientService: PatientService) {
    this.patientService = patientService;
  }

  async registerPatient(req: Request, res: Response) {
    try {
      const { userId, age, gender, medicalHistory } = req.body;
      const patientRecord = {
        userId,
        age,
        gender,
        medicalHistory,
      };
      const patient = await this.patientService.createPatient(patientRecord);
      return res.status(201).json({ patient });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async bookAppointment(req: Request, res: Response) {
    try {
      const { patientId, doctorId, timeSlot, date, reason } = req.body;
      await this.patientService.bookAppointment(patientId, doctorId, timeSlot, date, reason);
      return res.status(200).json({ message: "Appointment booked successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getAppointments(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const appointments = await this.patientService.getAppointments(patientId);
      return res.status(200).json({ appointments });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }
}

export default PatientController;


### Routes

#### routes/doctor.routes.ts
typescript
import express from "express";
import DoctorController from "../controllers/doctor.controller";
import { DoctorDataSource } from "../services/doctor.service";
import { UserService } from "../services/user.service";
import { UserDataSource } from "../datasources/user.datasource";

const router = express.Router();

const userService = new UserService(new UserDataSource());
const doctorService = new DoctorService(new DoctorDataSource());
const doctorController = new DoctorController(doctorService, userService);

router.post("/register", (req, res) => doctorController.registerDoctor(req, res));
router.post("/create-timeslot", (req, res) => doctorController.createTimeSlot(req, res));
router.get("/timeslots/:userId", (req, res) => doctorController.getAvailableTimeSlots(req, res));

export default router;


#### routes/patient.routes.ts
```typescript
import express from "express";
import PatientController from "../controllers/patient.controller";
import { PatientDataSource } from "../services/patient.service";

const router = express.Router();

const patientService = new PatientService(new PatientDataSource());
const patientController = new PatientController(patientService);

router.post("/register", (req, res) => patientController.registerPatient(req, res));
router.post("/book-appointment", (req, res) => patientController.bookAppointment(req, res));
router.get("/appointments/:patient