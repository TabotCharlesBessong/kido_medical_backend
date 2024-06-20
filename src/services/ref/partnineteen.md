Let's start by defining all the necessary components for handling patients and appointments in your application. We'll follow the architecture and coding style you provided earlier.

### Step 1: Define Enums

First, let's define any necessary enums.

```typescript
// patient.enum.ts
export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
};
```

### Step 2: Define Interfaces

Next, we define the interfaces.

```typescript
// patient.interface.ts
import { Model, Optional } from "sequelize";

export interface IPatient {
  id: string;
  userId: string;
  gender: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPatientCreationBody extends Optional<IPatient, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IPatientModel extends Model<IPatient, IPatientCreationBody>, IPatient {}

export interface IPatientDataSource {
  create(record: IPatientCreationBody): Promise<IPatient>;
  fetchOne(query: IFindPatientQuery): Promise<IPatient | null>;
  updateOne(searchBy: IFindPatientQuery, data: Partial<IPatient>): Promise<void>;
}

export interface IFindPatientQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}

// appointment.interface.ts
import { Model, Optional } from "sequelize";

export interface IAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  timeslotId: string;
  date: Date;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointmentCreationBody extends Optional<IAppointment, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IAppointmentModel extends Model<IAppointment, IAppointmentCreationBody>, IAppointment {}

export interface IAppointmentDataSource {
  create(record: IAppointmentCreationBody): Promise<IAppointment>;
  fetchOne(query: IFindAppointmentQuery): Promise<IAppointment | null>;
  updateOne(searchBy: IFindAppointmentQuery, data: Partial<IAppointment>): Promise<void>;
}

export interface IFindAppointmentQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}
```

### Step 3: Define Models

Next, we define the models.

```typescript
// patient.model.ts
import { DataTypes } from "sequelize";
import Db from "../database";
import { IPatientModel } from "../interfaces/patient.interface";
import { v4 as uuidv4 } from "uuid";

const PatientModel = Db.define<IPatientModel>('PatientModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
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
  tableName: 'patients',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default PatientModel;

// appointment.model.ts
import { DataTypes } from "sequelize";
import Db from "../database";
import { IAppointmentModel } from "../interfaces/appointment.interface";
import { v4 as uuidv4 } from "uuid";

const AppointmentModel = Db.define<IAppointmentModel>('AppointmentModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  timeslotId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
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
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default AppointmentModel;
```

### Step 4: Define Data Sources

Next, we define the data sources.

```typescript
// patient.datasource.ts
import { IFindPatientQuery, IPatient, IPatientCreationBody, IPatientDataSource } from "../interfaces/patient.interface";
import PatientModel from "../models/patient.model";

class PatientDataSource implements IPatientDataSource {
  async create(record: IPatientCreationBody): Promise<IPatient> {
    return await PatientModel.create(record);
  }

  async fetchOne(query: IFindPatientQuery): Promise<IPatient | null> {
    return await PatientModel.findOne(query);
  }

  async updateOne(searchBy: IFindPatientQuery, data: Partial<IPatient>): Promise<void> {
    await PatientModel.update(data, searchBy);
  }
}

export default PatientDataSource;
```
// appointment.datasource.ts

Let uss continue with the data sources and services:

```typescript
// appointment.datasource.ts
import { IFindAppointmentQuery, IAppointment, IAppointmentCreationBody, IAppointmentDataSource } from "../interfaces/appointment.interface";
import AppointmentModel from "../models/appointment.model";

class AppointmentDataSource implements IAppointmentDataSource {
  async create(record: IAppointmentCreationBody): Promise<IAppointment> {
    return await AppointmentModel.create(record);
  }

  async fetchOne(query: IFindAppointmentQuery): Promise<IAppointment | null> {
    return await AppointmentModel.findOne(query);
  }

  async updateOne(searchBy: IFindAppointmentQuery, data: Partial<IAppointment>): Promise<void> {
    await AppointmentModel.update(data, searchBy);
  }
}

export default AppointmentDataSource;
```

### Step 5: Define Services

```typescript
// patient.service.ts
import PatientDataSource from "../datasources/patient.datasource";
import { IPatientCreationBody, IPatient } from "../interfaces/patient.interface";

class PatientService {
  private patientDataSource: PatientDataSource;

  constructor() {
    this.patientDataSource = new PatientDataSource();
  }

  async createPatient(data: IPatientCreationBody): Promise<IPatient> {
    return await this.patientDataSource.create(data);
  }

  async getPatientById(userId: string): Promise<IPatient | null> {
    return await this.patientDataSource.fetchOne({ where: { userId } });
  }

  async updatePatient(userId: string, data: Partial<IPatient>): Promise<void> {
    await this.patientDataSource.updateOne({ where: { userId } }, data);
  }
}

export default PatientService;

// appointment.service.ts
import AppointmentDataSource from "../datasources/appointment.datasource";
import { IAppointmentCreationBody, IAppointment } from "../interfaces/appointment.interface";

class AppointmentService {
  private appointmentDataSource: AppointmentDataSource;

  constructor() {
    this.appointmentDataSource = new AppointmentDataSource();
  }

  async createAppointment(data: IAppointmentCreationBody): Promise<IAppointment> {
    return await this.appointmentDataSource.create(data);
  }

  async getAppointmentById(appointmentId: string): Promise<IAppointment | null> {
    return await this.appointmentDataSource.fetchOne({ where: { id: appointmentId } });
  }

  async updateAppointment(appointmentId: string, data: Partial<IAppointment>): Promise<void> {
    await this.appointmentDataSource.updateOne({ where: { id: appointmentId } }, data);
  }
}

export default AppointmentService;
```

### Step 6: Define Controllers

```typescript
// patient.controller.ts
import { Request, Response } from "express";
import PatientService from "../services/patient.service";
import AppointmentService from "../services/appointment.service";

class PatientController {
  private patientService: PatientService;
  private appointmentService: AppointmentService;

  constructor() {
    this.patientService = new PatientService();
    this.appointmentService = new AppointmentService();
  }

  async createPatient(req: Request, res: Response): Promise<void> {
    try {
      const patient = await this.patientService.createPatient(req.body);
      res.status(201).json(patient);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPatientById(req: Request, res: Response): Promise<void> {
    try {
      const patient = await this.patientService.getPatientById(req.params.userId);
      if (!patient) {
        res.status(404).json({ message: "Patient not found" });
      } else {
        res.status(200).json(patient);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async bookAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await this.appointmentService.createAppointment(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default PatientController;
```

### Step 7: Define Routes

```typescript
// patient.route.ts
import express, { Request, Response } from "express";
import PatientController from "../controllers/patient.controller";
import { validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/patient.validator.schema";

const createPatientRoute = () => {
  const router = express.Router();
  const patientController = new PatientController();

  router.post(
    "/create",
    validator(validationSchema.createPatientSchema),
    (req: Request, res: Response) => {
      return patientController.createPatient(req, res);
    }
  );

  router.get(
    "/:userId",
    (req: Request, res: Response) => {
      return patientController.getPatientById(req, res);
    }
  );

  router.post(
    "/:userId/appointments",
    validator(validationSchema.bookAppointmentSchema),
    (req: Request, res: Response) => {
      return patientController.bookAppointment(req, res);
    }
  );

  return router;
};

export default createPatientRoute;
```

### Step 8: Define Validation Schemas

```typescript
// patient.validator.schema.ts
import * as yup from "yup";

const createPatientSchema = yup.object({
  body: yup.object({
    userId: yup.string().uuid().required(),
    gender: yup.string().oneOf(["MALE", "FEMALE", "OTHER"]).required(),
    age: yup.number().min(0).required(),
  }),
});

const bookAppointmentSchema = yup.object({
  body: yup.object({
    patientId: yup.string().uuid().required(),
    doctorId: yup.string().uuid().required(),
    timeslotId: yup.string().uuid().required(),
    date: yup.date().required(),
    reason: yup.string().required(),
  }),
});

export default {
  createPatientSchema,
  bookAppointmentSchema,
};
```

### README.md Example for Patient Routes

### Patients

- **POST** `/api/patients/create`: Create a new patient profile.
  - **Request Body**:
    ```json
    {
      "userId": "string",
      "gender": "string",
      "age": "number"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "string",
      "userId": "string",
      "gender": "string",
      "age": "number",
      "createdAt": "date-time",
      "updatedAt": "date-time"
    }
    ```

- **GET** `/api/patients/:userId`: Get a patient's profile by user ID.
  - **Request Params**:
    - `userId`: string
  - **Response**:
    ```json
    {
      "id": "string",
      "userId": "string",
      "gender": "string",
      "age": "number",
      "createdAt": "date-time",
      "updatedAt": "date-time"
    }
    ```

- **POST** `/api/patients/:userId/appointments`: Book an appointment for a patient.
  - **Request Body**:
    ```json
    {
      "patientId": "string",
      "doctorId": "string",
      "timeslotId": "string",
      "date": "date-time",
      "reason": "string"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "string",
      "patientId": "string",
      "doctorId": "string",
      "timeslotId": "string",
      "date": "date-time",
      "reason": "string",
      "createdAt": "date-time",
      "updatedAt": "date-time"
    }
    ```

This setup provides a full implementation for handling patient profiles and booking appointments, including validation, services, and routing.