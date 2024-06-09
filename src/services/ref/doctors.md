```TS ---- doctor.services
import { IFindUserQuery, IUser, IUserDataSource } from "../interfaces/user.interfaces";
import { IDoctorDataSource, IAppointment, IPatientRecord, IPrescription } from "../interfaces/doctor.interfaces";

class DoctorService {
  private userDataSource: IUserDataSource;
  private doctorDataSource: IDoctorDataSource;

  constructor(userDataSource: IUserDataSource, doctorDataSource: IDoctorDataSource) {
    this.userDataSource = userDataSource;
    this.doctorDataSource = doctorDataSource;
  }

  async getDoctorById(id: string): Promise<IUser | null> {
    const query = { where: { id }, raw: true } as IFindUserQuery;
    return this.userDataSource.fetchOne(query);
  }

  async getAppointments(doctorId: string): Promise<IAppointment[]> {
    return this.doctorDataSource.fetchAppointmentsByDoctorId(doctorId);
  }

  async viewPatientRecord(patientId: string): Promise<IPatientRecord | null> {
    return this.doctorDataSource.fetchPatientRecordById(patientId);
  }

  async prescribeMedication(patientId: string, prescription: IPrescription): Promise<void> {
    await this.doctorDataSource.createPrescription(patientId, prescription);
  }

  async createAppointment(appointment: IAppointment): Promise<IAppointment> {
    return this.doctorDataSource.createAppointment(appointment);
  }
}

export default DoctorService;
```

```TS  ------ doctordatasource
import { IDoctorDataSource, IAppointment, IPatientRecord, IPrescription } from "../interfaces/doctor.interfaces";
import DoctorModel from "../models/doctor.model";
import AppointmentModel from "../models/appointment.model";
import PatientRecordModel from "../models/patientRecord.model";
import PrescriptionModel from "../models/prescription.model";

class DoctorDataSource implements IDoctorDataSource {
  async fetchAppointmentsByDoctorId(doctorId: string): Promise<IAppointment[]> {
    return AppointmentModel.findAll({ where: { doctorId } });
  }

  async fetchPatientRecordById(patientId: string): Promise<IPatientRecord | null> {
    return PatientRecordModel.findOne({ where: { patientId } });
  }

  async createPrescription(patientId: string, prescription: IPrescription): Promise<void> {
    await PrescriptionModel.create({ ...prescription, patientId });
  }

  async createAppointment(appointment: IAppointment): Promise<IAppointment> {
    return AppointmentModel.create(appointment);
  }
}

export default DoctorDataSource;
```

```TS ------- Doctor Controller
import { Request, Response } from "express";
import DoctorService from "../services/doctor.service";
import { IAppointment, IPrescription } from "../interfaces/doctor.interfaces";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code.enum";

class DoctorController {
  private doctorService: DoctorService;

  constructor(doctorService: DoctorService) {
    this.doctorService = doctorService;
  }

  async getAppointments(req: Request, res: Response) {
    try {
      const doctorId = req.user.id;
      const appointments = await this.doctorService.getAppointments(doctorId);
      return Utility.handleSuccess(res, "Appointments fetched successfully", { appointments }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, "Failed to fetch appointments", ResponseCode.SERVER_ERROR);
    }
  }

  async viewPatientRecord(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const patientRecord = await this.doctorService.viewPatientRecord(patientId);
      if (!patientRecord) {
        return Utility.handleError(res, "Patient record not found", ResponseCode.NOT_FOUND);
      }
      return Utility.handleSuccess(res, "Patient record fetched successfully", { patientRecord }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, "Failed to fetch patient record", ResponseCode.SERVER_ERROR);
    }
  }

  async prescribeMedication(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const prescription: IPrescription = req.body;
      await this.doctorService.prescribeMedication(patientId, prescription);
      return Utility.handleSuccess(res, "Prescription created successfully", {}, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, "Failed to create prescription", ResponseCode.SERVER_ERROR);
    }
  }

  async createAppointment(req: Request, res: Response) {
    try {
      const appointment: IAppointment = req.body;
      const newAppointment = await this.doctorService.createAppointment(appointment);
      return Utility.handleSuccess(res, "Appointment created successfully", { appointment: newAppointment }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, "Failed to create appointment", ResponseCode.SERVER_ERROR);
    }
  }
}

export default DoctorController;
```

```TS ---- interface
import { Model, Optional } from "sequelize";

export interface IAppointment {
  id?: string;
  doctorId: string;
  patientId: string;
  date: Date;
  time: string;
  reason: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPatientRecord {
  id: string;
  patientId: string;
  doctorId: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescription {
  id?: string;
  patientId: string;
  doctorId: string;
  medication: string;
  dosage: string;
  instructions: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDoctorModel extends Model<IDoctorModel, IDoctorCreationAttributes> {}

export interface IDoctorDataSource {
  fetchAppointmentsByDoctorId(doctorId: string): Promise<IAppointment[]>;
  fetchPatientRecordById(patientId: string): Promise<IPatientRecord | null>;
  createPrescription(patientId: string, prescription: IPrescription): Promise<void>;
  createAppointment(appointment: IAppointment): Promise<IAppointment>;
}
```

```TS Appointment model
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { IAppointment } from "../interfaces/doctor.interfaces";

const AppointmentModel = Db.define<IAppointment>("Appointment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'appointments',
});

export default AppointmentModel;
```

```TS ------- Patient Record
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { IPatientRecord } from "../interfaces/doctor.interfaces";

const PatientRecordModel = Db.define<IPatientRecord>("PatientRecord", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'patient_records',
});

export default PatientRecordModel;
```

```TS ------- Prescription model
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { IPrescription } from "../interfaces/doctor.interfaces";

const PrescriptionModel = Db.define<IPrescription>("Prescription", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  medication: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  instructions: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'prescriptions',
});

export default PrescriptionModel;
```

```TS -------- doctor routes
import express, { Request, Response } from "express";
import DoctorController from "../controllers/doctor.controller";
import DoctorService from "../services/doctor.service";
import DoctorDataSource from "../datasources/doctor.datasource";
import UserDataSource from "../datasources/user.datasource";
import { isAuthenticated, hasRole } from "../middlewares/auth.middlewares";

const createDoctorRoute = () => {
  const router = express.Router();
  const doctorService = new DoctorService(new UserDataSource(), new DoctorDataSource());
  const doctorController = new DoctorController(doctorService);

  router.get("/appointments", isAuthenticated, hasRole("DOCTOR"), (req: Request, res: Response) => {
    return doctorController.getAppointments(req, res);
  });

  router.get("/patient/:patientId/record", isAuthenticated, hasRole("DOCTOR"), (req: Request, res: Response) => {
    return doctorController.viewPatientRecord(req, res);
  });

  router.post("/patient/:patientId/prescribe", isAuthenticated, hasRole("DOCTOR"), (req: Request, res: Response) => {
    return doctorController.prescribeMedication(req, res);
  });

  router.post("/appointments", isAuthenticated, hasRole("DOCTOR"), (req: Request, res: Response) => {
    return doctorController.createAppointment(req, res);
  });

  return router;
};

export default createDoctorRoute;
```

```TS -------- Middlewares
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ResponseCode } from "../interfaces/enum/code.enum";
import Utility from "../utils/index.utils";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return Utility.handleError(res, "Unauthorized", ResponseCode.UNAUTHORIZED);
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      return Utility.handleError(res, "Unauthorized", ResponseCode.UNAUTHORIZED);
    }

    req.user = user;
    next();
  });
};

export const hasRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== role) {
      return Utility.handleError(res, "Forbidden", ResponseCode.FORBIDDEN);
    }
    next();
  };
};

```
