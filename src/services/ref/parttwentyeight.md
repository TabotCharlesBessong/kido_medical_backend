Here is an updated version of the consultation, prescription, tests, and medication features, including interfaces, models, data sources, services, controllers, validation schemas (using yup), and routes:

### Updated Interfaces

```typescript
// interfaces/consultation.interface.ts
import { FindOptions, Model, Optional, Transaction } from "sequelize";

export interface IConsultation {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  presentingComplaints: string;
  pastHistory: string;
  diagnosticImpression: string;
  investigations?: string;
  treatment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConsultationCreationBody
  extends Optional<IConsultation, "id" | "createdAt" | "updatedAt" | "investigations"> {}

export interface IConsultationModel
  extends Model<IConsultation, IConsultationCreationBody>,
    IConsultation {}

export interface IConsultationDataSource {
  create(
    record: IConsultationCreationBody,
    options?: Partial<IFindConsultationQuery>
  ): Promise<IConsultation>;
  fetchOne(query: IFindConsultationQuery): Promise<IConsultation | null>;
  updateOne(
    data: Partial<IConsultation>,
    query: IFindConsultationQuery
  ): Promise<void>;
  fetchAll(query: FindOptions<IConsultation>): Promise<IConsultation[]>;
}

export interface IFindConsultationQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  transaction?: Transaction;
  returning?: boolean;
}

// interfaces/prescription.interface.ts
export interface IPrescription {
  id: string;
  consultationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescriptionCreationBody
  extends Optional<IPrescription, "id" | "createdAt" | "updatedAt"> {}

export interface IPrescriptionModel
  extends Model<IPrescription, IPrescriptionCreationBody>,
    IPrescription {}

export interface IPrescriptionDataSource {
  create(record: IPrescriptionCreationBody): Promise<IPrescription>;
  fetchOne(query: IFindPrescriptionQuery): Promise<IPrescription | null>;
  updateOne(
    data: Partial<IPrescription>,
    query: IFindPrescriptionQuery
  ): Promise<void>;
  fetchAll(query: FindOptions<IPrescription>): Promise<IPrescription[]>;
}

export interface IFindPrescriptionQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  transaction?: Transaction;
  returning?: boolean;
}

// interfaces/signs-and-symptoms.interface.ts
export interface ISignsAndSymptoms {
  id: string;
  consultationId: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISignsAndSymptomsCreationBody
  extends Optional<ISignsAndSymptoms, "id" | "createdAt" | "updatedAt"> {}

export interface ISignsAndSymptomsModel
  extends Model<ISignsAndSymptoms, ISignsAndSymptomsCreationBody>,
    ISignsAndSymptoms {}

export interface ISignsAndSymptomsDataSource {
  create(record: ISignsAndSymptomsCreationBody): Promise<ISignsAndSymptoms>;
  fetchOne(query: IFindSignsAndSymptomsQuery): Promise<ISignsAndSymptoms | null>;
  updateOne(
    data: Partial<ISignsAndSymptoms>,
    query: IFindSignsAndSymptomsQuery
  ): Promise<void>;
  fetchAll(query: FindOptions<ISignsAndSymptoms>): Promise<ISignsAndSymptoms[]>;
}

export interface IFindSignsAndSymptomsQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  transaction?: Transaction;
  returning?: boolean;
}
```

### Models

```typescript
// models/consultation.model.ts
import { DataTypes, Sequelize } from "sequelize";
import {
  IConsultationModel,
  IConsultationCreationBody,
} from "../interfaces/consultation.interface";

const ConsultationModel = (sequelize: Sequelize) => {
  const Consultation = sequelize.define<IConsultationModel>(
    "Consultation",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      patientId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      appointmentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      presentingComplaints: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      pastHistory: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      diagnosticImpression: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      investigations: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      treatment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return Consultation;
};

export default ConsultationModel;

// models/prescription.model.ts
import { DataTypes, Sequelize } from "sequelize";
import {
  IPrescriptionModel,
  IPrescriptionCreationBody,
} from "../interfaces/prescription.interface";

const PrescriptionModel = (sequelize: Sequelize) => {
  const Prescription = sequelize.define<IPrescriptionModel>(
    "Prescription",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      consultationId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      medicationName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dosage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      frequency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );

  return Prescription;
};

export default PrescriptionModel;

// models/signs-and-symptoms.model.ts
import { DataTypes, Sequelize } from "sequelize";
import {
  ISignsAndSymptomsModel,
  ISignsAndSymptomsCreationBody,
} from "../interfaces/signs-and-symptoms.interface";

const SignsAndSymptomsModel = (sequelize: Sequelize) => {
  const SignsAndSymptoms = sequelize.define<ISignsAndSymptomsModel>(
    "SignsAndSymptoms",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      consultationId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return SignsAndSymptoms;
};

export default SignsAndSymptomsModel;
```

### Data Sources

```typescript
// datasources/consultation.datasource.ts
import {
  IConsultation,
  IConsultationCreationBody,
  IConsultationDataSource,
  IFindConsultationQuery,
} from "../interfaces/consultation.interface";
import ConsultationModel from "../models/consultation.model";
import { FindOptions, Sequelize } from "sequelize";

class ConsultationDataSource implements IConsultationDataSource {
  private model;

  constructor(sequelize: Sequelize) {
    this.model = ConsultationModel(sequelize);
  }

  async create(record: IConsultationCreationBody): Promise<IConsultation> {
    return await this.model.create(record);
  }

  async fetchOne(query: IFindConsultationQuery): Promise<IConsultation | null> {
    return await this.model.findOne(query);
  }

  async updateOne(
    data: Partial<IConsultation>,
    query: IFindConsultationQuery
  ): Promise<void> {
    await this.model.update(data, query);
  }

  async fetchAll(query: FindOptions<IConsultation>): Promise<IConsultation[]> {
    return await this.model.findAll(query);
  }
}

export default ConsultationDataSource;

// datasources/prescription.datasource.ts
import {
  IPrescription,
  IPrescriptionCreationBody,
  IPrescriptionDataSource,
  IFindPrescriptionQuery,
} from "../interfaces/prescription.interface";
import PrescriptionModel from "../models/prescription.model";
import { FindOptions, Sequelize } from "sequelize";

class PrescriptionDataSource implements IPrescriptionDataSource {
  private model;

  constructor(sequelize: Sequelize) {
    this.model = PrescriptionModel(sequelize);
  }

  async create(record: IPrescriptionCreationBody): Promise<IPrescription> {
    return await this.model.create(record);
  }

  async fetchOne(query: IFindPrescriptionQuery): Promise<IPrescription | null> {
    return await this.model.findOne(query);
  }

  async updateOne(
    data: Partial<IPrescription>,
    query: IFindPrescriptionQuery
  ): Promise<void> {
    await this.model.update(data, query);
  }

  async fetchAll(query: FindOptions<IPrescription>): Promise<IPrescription[]> {
    return await this.model.findAll(query);
  }
}

export default PrescriptionDataSource;

// datasources/signs-and-symptoms.datasource.ts
import {
  ISignsAndSymptoms,
  ISignsAndSymptomsCreationBody,
  ISignsAndSymptomsDataSource,


  IFindSignsAndSymptomsQuery,
} from "../interfaces/signs-and-symptoms.interface";
import SignsAndSymptomsModel from "../models/signs-and-symptoms.model";
import { FindOptions, Sequelize } from "sequelize";

class SignsAndSymptomsDataSource implements ISignsAndSymptomsDataSource {
  private model;

  constructor(sequelize: Sequelize) {
    this.model = SignsAndSymptomsModel(sequelize);
  }

  async create(
    record: ISignsAndSymptomsCreationBody
  ): Promise<ISignsAndSymptoms> {
    return await this.model.create(record);
  }

  async fetchOne(
    query: IFindSignsAndSymptomsQuery
  ): Promise<ISignsAndSymptoms | null> {
    return await this.model.findOne(query);
  }

  async updateOne(
    data: Partial<ISignsAndSymptoms>,
    query: IFindSignsAndSymptomsQuery
  ): Promise<void> {
    await this.model.update(data, query);
  }

  async fetchAll(
    query: FindOptions<ISignsAndSymptoms>
  ): Promise<ISignsAndSymptoms[]> {
    return await this.model.findAll(query);
  }
}

export default SignsAndSymptomsDataSource;
```

### Services

```typescript
// services/consultation.service.ts
import { IConsultation, IConsultationCreationBody, IConsultationDataSource } from "../interfaces/consultation.interface";

class ConsultationService {
  private dataSource: IConsultationDataSource;

  constructor(dataSource: IConsultationDataSource) {
    this.dataSource = dataSource;
  }

  async createConsultation(data: IConsultationCreationBody): Promise<IConsultation> {
    return await this.dataSource.create(data);
  }

  async getConsultation(id: string): Promise<IConsultation | null> {
    return await this.dataSource.fetchOne({ where: { id } });
  }

  async updateConsultation(id: string, data: Partial<IConsultation>): Promise<void> {
    await this.dataSource.updateOne(data, { where: { id } });
  }

  async listConsultations(): Promise<IConsultation[]> {
    return await this.dataSource.fetchAll({});
  }
}

export default ConsultationService;

// services/prescription.service.ts
import { IPrescription, IPrescriptionCreationBody, IPrescriptionDataSource } from "../interfaces/prescription.interface";

class PrescriptionService {
  private dataSource: IPrescriptionDataSource;

  constructor(dataSource: IPrescriptionDataSource) {
    this.dataSource = dataSource;
  }

  async createPrescription(data: IPrescriptionCreationBody): Promise<IPrescription> {
    return await this.dataSource.create(data);
  }

  async getPrescription(id: string): Promise<IPrescription | null> {
    return await this.dataSource.fetchOne({ where: { id } });
  }

  async updatePrescription(id: string, data: Partial<IPrescription>): Promise<void> {
    await this.dataSource.updateOne(data, { where: { id } });
  }

  async listPrescriptions(): Promise<IPrescription[]> {
    return await this.dataSource.fetchAll({});
  }
}

export default PrescriptionService;

// services/signs-and-symptoms.service.ts
import { ISignsAndSymptoms, ISignsAndSymptomsCreationBody, ISignsAndSymptomsDataSource } from "../interfaces/signs-and-symptoms.interface";

class SignsAndSymptomsService {
  private dataSource: ISignsAndSymptomsDataSource;

  constructor(dataSource: ISignsAndSymptomsDataSource) {
    this.dataSource = dataSource;
  }

  async createSignsAndSymptoms(data: ISignsAndSymptomsCreationBody): Promise<ISignsAndSymptoms> {
    return await this.dataSource.create(data);
  }

  async getSignsAndSymptoms(id: string): Promise<ISignsAndSymptoms | null> {
    return await this.dataSource.fetchOne({ where: { id } });
  }

  async updateSignsAndSymptoms(id: string, data: Partial<ISignsAndSymptoms>): Promise<void> {
    await this.dataSource.updateOne(data, { where: { id } });
  }

  async listSignsAndSymptoms(): Promise<ISignsAndSymptoms[]> {
    return await this.dataSource.fetchAll({});
  }
}

export default SignsAndSymptomsService;
```

### Controllers

```typescript
// controllers/consultation.controller.ts
import { Request, Response } from "express";
import ConsultationService from "../services/consultation.service";

class ConsultationController {
  private service: ConsultationService;

  constructor(service: ConsultationService) {
    this.service = service;
  }

  async createConsultation(req: Request, res: Response): Promise<void> {
    try {
      const consultation = await this.service.createConsultation(req.body);
      res.status(201).json(consultation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getConsultation(req: Request, res: Response): Promise<void> {
    try {
      const consultation = await this.service.getConsultation(req.params.id);
      if (consultation) {
        res.status(200).json(consultation);
      } else {
        res.status(404).json({ message: "Consultation not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateConsultation(req: Request, res: Response): Promise<void> {
    try {
      await this.service.updateConsultation(req.params.id, req.body);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async listConsultations(req: Request, res: Response): Promise<void> {
    try {
      const consultations = await this.service.listConsultations();
      res.status(200).json(consultations);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default ConsultationController;

// controllers/prescription.controller.ts
import { Request, Response } from "express";
import PrescriptionService from "../services/prescription.service";

class PrescriptionController {
  private service: PrescriptionService;

  constructor(service: PrescriptionService) {
    this.service = service;
  }

  async createPrescription(req: Request, res: Response): Promise<void> {
    try {
      const prescription = await this.service.createPrescription(req.body);
      res.status(201).json(prescription);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getPrescription(req: Request, res: Response): Promise<void> {
    try {
      const prescription = await this.service.getPrescription(req.params.id);
      if (prescription) {
        res.status(200).json(prescription);
      } else {
        res.status(404).json({ message: "Prescription not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updatePrescription(req: Request, res: Response): Promise<void> {
    try {
      await this.service.updatePrescription(req.params.id, req.body);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async listPrescriptions(req: Request, res: Response): Promise<void> {
    try {
      const prescriptions = await this.service.listPrescriptions();
      res.status(200).json(prescriptions);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default PrescriptionController;

// controllers/signs-and-symptoms.controller.ts
import { Request, Response } from "express";
import SignsAndSymptomsService from "../services/signs-and-symptoms.service";

class SignsAndSymptomsController {
  private service: SignsAndSymptomsService;

  constructor(service: SignsAndSymptomsService) {
    this.service = service;
  }

  async createSignsAndSymptoms(req: Request, res: Response): Promise<void> {
    try {
      const signsAndSymptoms = await this.service.createSignsAndSymptoms(req.body);
      res.status(201).json(signsAndSymptoms);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getSignsAndSymptoms(req: Request, res: Response): Promise<void> {
    try {
      const signsAndSymptoms = await this.service.getSignsAndSymptoms(req.params.id);
      if (signsAndSymptoms) {
        res.status(200).json(signsAndSymptoms);
      } else {
        res.status(404).json({ message: "Signs and symptoms not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateSignsAndSymptoms(req: Request, res: Response): Promise<void> {
    try {
      await this.service.updateSignsAndSymptoms(req.params.id, req.body);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async listSignsAndSymptoms(req: Request, res: Response): Promise<void> {
    try {
      const signsAndSymptoms = await this.service.listSignsAndSymptoms();
      res.status(200).json(signsAndSymptoms);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default SignsAndSymptomsController;
```

### Validation Schemas

```typescript
// validations/consultation.validation.ts
import * as yup from "yup";

export const createConsultationSchema = yup.object({
  patientId: yup.string().uuid().required(),
  doctorId:

 yup.string().uuid().required(),
  date: yup.date().required(),
  diagnosis: yup.string().required(),
});

export const updateConsultationSchema = yup.object({
  patientId: yup.string().uuid(),
  doctorId: yup.string().uuid(),
  date: yup.date(),
  diagnosis: yup.string(),
});

// validations/prescription.validation.ts
import * as yup from "yup";

export const createPrescriptionSchema = yup.object({
  consultationId: yup.string().uuid().required(),
  medication: yup.string().required(),
  dosage: yup.string().required(),
  frequency: yup.string().required(),
});

export const updatePrescriptionSchema = yup.object({
  consultationId: yup.string().uuid(),
  medication: yup.string(),
  dosage: yup.string(),
  frequency: yup.string(),
});

// validations/signs-and-symptoms.validation.ts
import * as yup from "yup";

export const createSignsAndSymptomsSchema = yup.object({
  consultationId: yup.string().uuid().required(),
  description: yup.string().required(),
  duration: yup.number().required(),
  severity: yup.string().required(),
});

export const updateSignsAndSymptomsSchema = yup.object({
  consultationId: yup.string().uuid(),
  description: yup.string(),
  duration: yup.number(),
  severity: yup.string(),
});
```

### Routes

```typescript
// routes/consultation.routes.ts
import { Router } from "express";
import ConsultationController from "../controllers/consultation.controller";
import ConsultationService from "../services/consultation.service";
import ConsultationDataSource from "../data-sources/consultation.data-source";
import { validateRequest } from "../middlewares/validate-request";
import { createConsultationSchema, updateConsultationSchema } from "../validations/consultation.validation";
import { sequelize } from "../db";

const router = Router();
const consultationDataSource = new ConsultationDataSource(sequelize);
const consultationService = new ConsultationService(consultationDataSource);
const consultationController = new ConsultationController(consultationService);

router.post("/", validateRequest(createConsultationSchema), consultationController.createConsultation.bind(consultationController));
router.get("/:id", consultationController.getConsultation.bind(consultationController));
router.put("/:id", validateRequest(updateConsultationSchema), consultationController.updateConsultation.bind(consultationController));
router.get("/", consultationController.listConsultations.bind(consultationController));

export default router;

// routes/prescription.routes.ts
import { Router } from "express";
import PrescriptionController from "../controllers/prescription.controller";
import PrescriptionService from "../services/prescription.service";
import PrescriptionDataSource from "../data-sources/prescription.data-source";
import { validateRequest } from "../middlewares/validate-request";
import { createPrescriptionSchema, updatePrescriptionSchema } from "../validations/prescription.validation";
import { sequelize } from "../db";

const router = Router();
const prescriptionDataSource = new PrescriptionDataSource(sequelize);
const prescriptionService = new PrescriptionService(prescriptionDataSource);
const prescriptionController = new PrescriptionController(prescriptionService);

router.post("/", validateRequest(createPrescriptionSchema), prescriptionController.createPrescription.bind(prescriptionController));
router.get("/:id", prescriptionController.getPrescription.bind(prescriptionController));
router.put("/:id", validateRequest(updatePrescriptionSchema), prescriptionController.updatePrescription.bind(prescriptionController));
router.get("/", prescriptionController.listPrescriptions.bind(prescriptionController));

export default router;

// routes/signs-and-symptoms.routes.ts
import { Router } from "express";
import SignsAndSymptomsController from "../controllers/signs-and-symptoms.controller";
import SignsAndSymptomsService from "../services/signs-and-symptoms.service";
import SignsAndSymptomsDataSource from "../data-sources/signs-and-symptoms.data-source";
import { validateRequest } from "../middlewares/validate-request";
import { createSignsAndSymptomsSchema, updateSignsAndSymptomsSchema } from "../validations/signs-and-symptoms.validation";
import { sequelize } from "../db";

const router = Router();
const signsAndSymptomsDataSource = new SignsAndSymptomsDataSource(sequelize);
const signsAndSymptomsService = new SignsAndSymptomsService(signsAndSymptomsDataSource);
const signsAndSymptomsController = new SignsAndSymptomsController(signsAndSymptomsService);

router.post("/", validateRequest(createSignsAndSymptomsSchema), signsAndSymptomsController.createSignsAndSymptoms.bind(signsAndSymptomsController));
router.get("/:id", signsAndSymptomsController.getSignsAndSymptoms.bind(signsAndSymptomsController));
router.put("/:id", validateRequest(updateSignsAndSymptomsSchema), signsAndSymptomsController.updateSignsAndSymptoms.bind(signsAndSymptomsController));
router.get("/", signsAndSymptomsController.listSignsAndSymptoms.bind(signsAndSymptomsController));

export default router;
```

### Entry Point

```typescript
// index.ts
import express from "express";
import bodyParser from "body-parser";
import consultationRoutes from "./routes/consultation.routes";
import prescriptionRoutes from "./routes/prescription.routes";
import signsAndSymptomsRoutes from "./routes/signs-and-symptoms.routes";
import { sequelize } from "./db";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use("/consultations", consultationRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/signs-and-symptoms", signsAndSymptomsRoutes);

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error("Unable to connect to the database:", err);
});
```

### Middlewares

```typescript
// middlewares/validate-request.ts
import { Request, Response, NextFunction } from "express";
import { AnySchema } from "yup";

export const validateRequest = (schema: AnySchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.validate(req.body);
    next();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
```

In the above code:

1. **Models**: Define Sequelize models for consultations, prescriptions, and signs and symptoms.
2. **Data Sources**: Implement CRUD operations for each model.
3. **Services**: Provide a higher-level abstraction for business logic.
4. **Controllers**: Handle HTTP requests, call services, and return responses.
5. **Validation Schemas**: Define request validation schemas using `yup`.
6. **Routes**: Define Express routes and bind them to controller methods.
7. **Entry Point**: Set up the Express application and start the server.
8. **Middlewares**: Implement a middleware for request validation.

This code provides a foundation for managing medical consultations, prescriptions, and signs and symptoms in an Express application with Sequelize ORM for database interaction.