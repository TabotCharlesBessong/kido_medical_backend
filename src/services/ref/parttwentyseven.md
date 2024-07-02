You're right. To properly associate medications with prescriptions, we need to define the medications column in the prescription model. Here's the corrected implementation:

### Models

#### prescription.model.ts
```typescript
import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import { IPrescriptionModel } from '../interfaces/prescription.interface';
import MedicationModel from './medication.model';

const PrescriptionModel = sequelize.define<IPrescriptionModel>('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
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
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  medications: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  timestamps: true,
});

PrescriptionModel.hasMany(MedicationModel, { foreignKey: 'prescriptionId' });
MedicationModel.belongsTo(PrescriptionModel, { foreignKey: 'prescriptionId' });

export default PrescriptionModel;
```

#### medication.model.ts
```typescript
import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import { IMedicationModel, Frequency } from '../interfaces/medication.interface';

const MedicationModel = sequelize.define<IMedicationModel>('Medication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  prescriptionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  frequency: {
    type: DataTypes.ENUM(Frequency.ONCE_A_DAY, Frequency.TWICE_A_DAY, Frequency.THRICE_A_DAY),
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
});

export default MedicationModel;
```

### Interfaces

#### prescription.interface.ts
```typescript
import { Model, Optional, Transaction } from "sequelize";
import { IMedication } from "./medication.interface";

export interface IPrescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  medications: IMedication[]; // Array of medications
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescriptionCreationBody extends Optional<IPrescription, "id" | "createdAt" | "updatedAt"> {}

export interface IPrescriptionModel extends Model<IPrescription, IPrescriptionCreationBody>, IPrescription {}

export interface IPrescriptionDataSource {
  create(
    record: IPrescriptionCreationBody,
    options?: Partial<IFindPrescriptionQuery>
  ): Promise<IPrescription>;
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
```

### Data Sources

#### prescription.datasource.ts
```typescript
import { FindOptions } from "sequelize";
import {
  IFindPrescriptionQuery,
  IPrescription,
  IPrescriptionCreationBody,
  IPrescriptionDataSource,
} from "../interfaces/prescription.interface";
import PrescriptionModel from "../models/prescription.model";

class PrescriptionDataSource implements IPrescriptionDataSource {
  async create(
    record: IPrescriptionCreationBody,
    options?: Partial<IFindPrescriptionQuery>
  ): Promise<IPrescription> {
    return await PrescriptionModel.create(record, {
      returning: true,
      ...options,
    });
  }

  async fetchOne(query: IFindPrescriptionQuery): Promise<IPrescription | null> {
    return await PrescriptionModel.findOne(query);
  }

  async updateOne(
    data: Partial<IPrescription>,
    query: IFindPrescriptionQuery
  ): Promise<void> {
    await PrescriptionModel.update(data, query);
  }

  async fetchAll(query: FindOptions<IPrescription>): Promise<IPrescription[]> {
    return await PrescriptionModel.findAll(query);
  }
}

export default PrescriptionDataSource;
```

### Services

#### prescription.service.ts
```typescript
import PrescriptionDataSource from "../datasources/prescription.datasource";
import MedicationDataSource from "../datasources/medication.datasource";
import {
  IPrescription,
  IPrescriptionCreationBody,
  IPrescriptionDataSource,
  IFindPrescriptionQuery,
} from "../interfaces/prescription.interface";
import {
  IMedication,
  IMedicationCreationBody,
  IMedicationDataSource,
} from "../interfaces/medication.interface";

class PrescriptionService {
  private prescriptionDataSource: IPrescriptionDataSource;
  private medicationDataSource: IMedicationDataSource;

  constructor() {
    this.prescriptionDataSource = new PrescriptionDataSource();
    this.medicationDataSource = new MedicationDataSource();
  }

  async createPrescription(
    prescriptionData: Partial<IPrescription>,
    medications: IMedicationCreationBody[]
  ): Promise<IPrescription> {
    const prescription = await this.prescriptionDataSource.create(
      prescriptionData
    );

    for (const medication of medications) {
      medication.prescriptionId = prescription.id;
      await this.medicationDataSource.create(medication);
    }

    return prescription;
  }

  async getPrescriptionById(prescriptionId: string): Promise<IPrescription | null> {
    return await this.prescriptionDataSource.fetchOne({
      where: { id: prescriptionId },
    });
  }

  async updatePrescription(
    id: string,
    data: Partial<IPrescription>,
    medications: IMedicationCreationBody[]
  ): Promise<void> {
    const filter = { where: { id } } as IFindPrescriptionQuery;
    await this.prescriptionDataSource.updateOne(data, filter);

    for (const medication of medications) {
      medication.prescriptionId = id;
      await this.medicationDataSource.create(medication);
    }
  }

  async getPrescriptions(): Promise<IPrescription[]> {
    const query = { where: {}, raw: true };
    return this.prescriptionDataSource.fetchAll(query);
  }
}

export default PrescriptionService;
```

### Controllers

#### prescription.controller.ts
```typescript
import { Request, Response } from "express";
import sequelize from "../database";
import { ResponseCode } from "../interfaces/enum/code.enum";
import PrescriptionService from "../services/prescription.service";
import Utility from "../utils/index.utils";

class PrescriptionController {
  private prescriptionService: PrescriptionService;

  constructor() {
    this.prescriptionService = new PrescriptionService();
  }

  async createPrescription(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { prescription, medications } = req.body;
      const newPrescription = await this.prescriptionService.createPrescription(
        prescription,
        medications
      );
      await transaction.commit();
      return Utility.handleSuccess(
        res,
        "Prescription created successfully",
        { newPrescription },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      await transaction.rollback();
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getPrescriptionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prescription = await this.prescriptionService.getPrescriptionById(id);
      if (!prescription) {
        return Utility.handleError(
          res,
          "Prescription not found",
          ResponseCode.NOT_FOUND
        );
      }
      return Utility.handleSuccess(
        res,
        "Prescription fetched successfully",
        { prescription },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async updatePrescription(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { prescription, medications } = req.body;
      await this.prescriptionService.updatePrescription(id, prescription, medications);
      await transaction.commit();
      return Utility.handleSuccess(
        res,
        "Prescription updated successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      await transaction.rollback();
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getPrescriptions(req: Request, res: Response) {
    try {
      const prescriptions = await this.prescriptionService.getPrescriptions();
      return Utility.handleSuccess(
        res,
        "Prescriptions fetched successfully",
        { prescriptions },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }
}

export default PrescriptionController;
```

### Routes

#### routes/prescription.routes.ts
```typescript
import { Router } from 'express';
import PrescriptionController from '../controllers

/prescription.controller';

const router = Router();
const prescriptionController = new PrescriptionController();

router.post('/prescriptions', prescriptionController.createPrescription.bind(prescriptionController));
router.get('/prescriptions', prescriptionController.getPrescriptions.bind(prescriptionController));
router.get('/prescriptions/:id', prescriptionController.getPrescriptionById.bind(prescriptionController));
router.put('/prescriptions/:id', prescriptionController.updatePrescription.bind(prescriptionController));

export default router;
```

#### main server file (e.g., app.ts)
```typescript
import express from 'express';
import bodyParser from 'body-parser';
import prescriptionRoutes from './routes/prescription.routes';
// Other imports...

const app = express();

app.use(bodyParser.json());

app.use('/api', prescriptionRoutes);
// Other routes...

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

This setup includes the medications column in the prescriptions model and ensures that medications are linked to prescriptions.