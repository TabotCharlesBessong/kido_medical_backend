Let's provide a full update, ensuring we have proper interfaces, models, datasources, services, controllers, and validation schemas.

### Updated Interfaces

#### consultation.interface.ts

```typescript consultation
import { FindOptions, Model, Optional, Transaction } from "sequelize";

export interface IConsultation {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  presentingComplaints: string;
  pastHistory: string;
  diagnosticImpression: string;
  investigations: string;
  treatment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConsultationCreationBody
  extends Optional<IConsultation, "id" | "createdAt" | "updatedAt"> {}

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
```

``` ts test
export interface ITest {
  id: string;
  consultationId: string;
  testName: string;
  testResult: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITestCreationBody extends Optional<ITest, "id" | "createdAt" | "updatedAt"> {}

export interface ITestModel extends Model<ITest, ITestCreationBody>, ITest {}

export interface ITestDataSource {
  create(record: ITestCreationBody): Promise<ITest>;
  fetchOne(query: IFindTestQuery): Promise<ITest | null>;
  updateOne(data: Partial<ITest>, query: IFindTestQuery): Promise<void>;
  fetchAll(query: FindOptions<ITest>): Promise<ITest[]>;
}

export interface IFindTestQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  transaction?: Transaction;
  returning?: boolean;
}
```

``` ts prescription
export interface IPrescription {
  id: string;
  consultationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescriptionCreationBody extends Optional<IPrescription, "id" | "createdAt" | "updatedAt"> {}

export interface IPrescriptionModel extends Model<IPrescription, IPrescriptionCreationBody>, IPrescription {}

export interface IPrescriptionDataSource {
  create(record: IPrescriptionCreationBody): Promise<IPrescription>;
  fetchOne(query: IFindPrescriptionQuery): Promise<IPrescription | null>;
  updateOne(data: Partial<IPrescription>, query: IFindPrescriptionQuery): Promise<void>;
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

``` ts medication
export interface IMedication {
  id: string;
  prescriptionId: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedicationCreationBody extends Optional<IMedication, "id" | "createdAt" | "updatedAt"> {}

export interface IMedicationModel extends Model<IMedication, IMedicationCreationBody>, IMedication {}

export interface IMedicationDataSource {
  create(record: IMedicationCreationBody): Promise<IMedication>;
  fetchOne(query: IFindMedicationQuery): Promise<IMedication | null>;
  updateOne(data: Partial<IMedication>, query: IFindMedicationQuery): Promise<void>;
  fetchAll(query: FindOptions<IMedication>): Promise<IMedication[]>;
}

export interface IFindMedicationQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  transaction?: Transaction;
  returning?: boolean;
}
```

### Models

#### consultation.model.ts

```typescript
import { DataTypes, Model, Sequelize } from "sequelize";

class Consultation extends Model {
  public id!: string;
  public patientId!: string;
  public doctorId!: string;
  public appointmentId!: string;
  public presentingComplaints!: string;
  public pastHistory!: string;
  public diagnosticImpression!: string;
  public investigations!: string;
  public treatment!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const initializeConsultationModel = (sequelize: Sequelize) => {
  Consultation.init(
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      pastHistory: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      diagnosticImpression: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      investigations: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      treatment: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Consultation",
    }
  );
};

export { Consultation, initializeConsultationModel };
```

#### test.model.ts

```typescript
import { DataTypes, Model, Sequelize } from "sequelize";

class Test extends Model {
  public id!: string;
  public consultationId!: string;
  public testName!: string;
  public testResult!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const initializeTestModel = (sequelize: Sequelize) => {
  Test.init(
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
      testName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      testResult: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Test",
    }
  );
};

export { Test, initializeTestModel };
```

#### prescription.model.ts

```typescript
import { DataTypes, Model, Sequelize } from "sequelize";

class Prescription extends Model {
  public id!: string;
  public consultationId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const initializePrescriptionModel = (sequelize: Sequelize) => {
  Prescription.init(
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
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Prescription",
    }
  );
};

export { Prescription, initializePrescriptionModel };
```

#### medication.model.ts

```typescript
import { DataTypes, Model, Sequelize } from "sequelize";

class Medication extends Model {
  public id!: string;
  public prescriptionId!: string;
  public name!: string;
  public dosage!: string;
  public frequency!: string;
  public instructions!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const initializeMedicationModel = (sequelize: Sequelize) => {
  Medication.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      instructions: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Medication",
    }
  );


};

export { Medication, initializeMedicationModel };
```

### Data Sources

#### consultation.datasource.ts

```typescript
import { Consultation, initializeConsultationModel } from "../models/consultation.model";
import { IConsultationDataSource, IConsultationCreationBody, IFindConsultationQuery } from "../interfaces/consultation.interface";
import { Sequelize, FindOptions } from "sequelize";

class ConsultationDataSource implements IConsultationDataSource {
  constructor(private sequelize: Sequelize) {
    initializeConsultationModel(sequelize);
  }

  async create(record: IConsultationCreationBody): Promise<Consultation> {
    return Consultation.create(record);
  }

  async fetchOne(query: IFindConsultationQuery): Promise<Consultation | null> {
    return Consultation.findOne({ where: query.where });
  }

  async updateOne(data: Partial<Consultation>, query: IFindConsultationQuery): Promise<void> {
    await Consultation.update(data, { where: query.where });
  }

  async fetchAll(query: FindOptions<Consultation>): Promise<Consultation[]> {
    return Consultation.findAll(query);
  }
}

export { ConsultationDataSource };
```

#### test.datasource.ts

```typescript
import { Test, initializeTestModel } from "../models/test.model";
import { ITestDataSource, ITestCreationBody, IFindTestQuery } from "../interfaces/consultation.interface";
import { Sequelize, FindOptions } from "sequelize";

class TestDataSource implements ITestDataSource {
  constructor(private sequelize: Sequelize) {
    initializeTestModel(sequelize);
  }

  async create(record: ITestCreationBody): Promise<Test> {
    return Test.create(record);
  }

  async fetchOne(query: IFindTestQuery): Promise<Test | null> {
    return Test.findOne({ where: query.where });
  }

  async updateOne(data: Partial<Test>, query: IFindTestQuery): Promise<void> {
    await Test.update(data, { where: query.where });
  }

  async fetchAll(query: FindOptions<Test>): Promise<Test[]> {
    return Test.findAll(query);
  }
}

export { TestDataSource };
```

#### prescription.datasource.ts

```typescript
import { Prescription, initializePrescriptionModel } from "../models/prescription.model";
import { IPrescriptionDataSource, IPrescriptionCreationBody, IFindPrescriptionQuery } from "../interfaces/consultation.interface";
import { Sequelize, FindOptions } from "sequelize";

class PrescriptionDataSource implements IPrescriptionDataSource {
  constructor(private sequelize: Sequelize) {
    initializePrescriptionModel(sequelize);
  }

  async create(record: IPrescriptionCreationBody): Promise<Prescription> {
    return Prescription.create(record);
  }

  async fetchOne(query: IFindPrescriptionQuery): Promise<Prescription | null> {
    return Prescription.findOne({ where: query.where });
  }

  async updateOne(data: Partial<Prescription>, query: IFindPrescriptionQuery): Promise<void> {
    await Prescription.update(data, { where: query.where });
  }

  async fetchAll(query: FindOptions<Prescription>): Promise<Prescription[]> {
    return Prescription.findAll(query);
  }
}

export { PrescriptionDataSource };
```

#### medication.datasource.ts

```typescript
import { Medication, initializeMedicationModel } from "../models/medication.model";
import { IMedicationDataSource, IMedicationCreationBody, IFindMedicationQuery } from "../interfaces/consultation.interface";
import { Sequelize, FindOptions } from "sequelize";

class MedicationDataSource implements IMedicationDataSource {
  constructor(private sequelize: Sequelize) {
    initializeMedicationModel(sequelize);
  }

  async create(record: IMedicationCreationBody): Promise<Medication> {
    return Medication.create(record);
  }

  async fetchOne(query: IFindMedicationQuery): Promise<Medication | null> {
    return Medication.findOne({ where: query.where });
  }

  async updateOne(data: Partial<Medication>, query: IFindMedicationQuery): Promise<void> {
    await Medication.update(data, { where: query.where });
  }

  async fetchAll(query: FindOptions<Medication>): Promise<Medication[]> {
    return Medication.findAll(query);
  }
}

export { MedicationDataSource };
```

### Services

#### consultation.service.ts

```typescript
import { IConsultationDataSource, IConsultationCreationBody } from "../interfaces/consultation.interface";
import { ConsultationDataSource } from "../datasources/consultation.datasource";

class ConsultationService {
  private dataSource: IConsultationDataSource;

  constructor(dataSource: IConsultationDataSource) {
    this.dataSource =

Let's continue from the `ConsultationService`.
```
### Services (continued)

#### consultation.service.ts

```typescript
import { IConsultationDataSource, IConsultationCreationBody } from "../interfaces/consultation.interface";

class ConsultationService {
  private dataSource: IConsultationDataSource;

  constructor(dataSource: IConsultationDataSource) {
    this.dataSource = dataSource;
  }

  async createConsultation(record: IConsultationCreationBody) {
    return this.dataSource.create(record);
  }

  async getConsultationById(id: string) {
    return this.dataSource.fetchOne({ where: { id } });
  }

  async updateConsultation(id: string, data: Partial<IConsultationCreationBody>) {
    await this.dataSource.updateOne(data, { where: { id } });
  }

  async getAllConsultations() {
    return this.dataSource.fetchAll({});
  }
}

export { ConsultationService };
```

### Controllers

#### consultation.controller.ts

```typescript
import { Request, Response } from "express";
import { ConsultationService } from "../services/consultation.service";
import { Utility } from "../utility/utility";

class ConsultationController {
  private consultationService: ConsultationService;

  constructor(consultationService: ConsultationService) {
    this.consultationService = consultationService;
  }

  createConsultation = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      Utility.validateRequest(body); // Use utility function for validation
      const consultation = await this.consultationService.createConsultation(body);
      res.status(201).json(consultation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getConsultation = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const consultation = await this.consultationService.getConsultationById(id);
      if (!consultation) {
        return res.status(404).json({ error: "Consultation not found" });
      }
      res.status(200).json(consultation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateConsultation = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body = req.body;
      Utility.validateRequest(body); // Use utility function for validation
      await this.consultationService.updateConsultation(id, body);
      res.status(200).json({ message: "Consultation updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getAllConsultations = async (req: Request, res: Response) => {
    try {
      const consultations = await this.consultationService.getAllConsultations();
      res.status(200).json(consultations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export { ConsultationController };
```

### test.service.ts

```typescript
import { ITestDataSource, ITestCreationBody } from "../interfaces/consultation.interface";

class TestService {
  private dataSource: ITestDataSource;

  constructor(dataSource: ITestDataSource) {
    this.dataSource = dataSource;
  }

  async createTest(record: ITestCreationBody) {
    return this.dataSource.create(record);
  }

  async getTestById(id: string) {
    return this.dataSource.fetchOne({ where: { id } });
  }

  async updateTest(id: string, data: Partial<ITestCreationBody>) {
    await this.dataSource.updateOne(data, { where: { id } });
  }

  async getAllTests() {
    return this.dataSource.fetchAll({});
  }
}

export { TestService };
```

### Controllers

#### test.controller.ts

```typescript
import { Request, Response } from "express";
import { TestService } from "../services/test.service";
import { Utility } from "../utility/utility";

class TestController {
  private testService: TestService;

  constructor(testService: TestService) {
    this.testService = testService;
  }

  createTest = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      Utility.validateRequest(body); // Use utility function for validation
      const test = await this.testService.createTest(body);
      res.status(201).json(test);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getTest = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const test = await this.testService.getTestById(id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.status(200).json(test);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateTest = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body = req.body;
      Utility.validateRequest(body); // Use utility function for validation
      await this.testService.updateTest(id, body);
      res.status(200).json({ message: "Test updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getAllTests = async (req: Request, res: Response) => {
    try {
      const tests = await this.testService.getAllTests();
      res.status(200).json(tests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export { TestController };
```

### prescription.service.ts

```typescript
import { IPrescriptionDataSource, IPrescriptionCreationBody } from "../interfaces/consultation.interface";

class PrescriptionService {
  private dataSource: IPrescriptionDataSource;

  constructor(dataSource: IPrescriptionDataSource) {
    this.dataSource = dataSource;
  }

  async createPrescription(record: IPrescriptionCreationBody) {
    return this.dataSource.create(record);
  }

  async getPrescriptionById(id: string) {
    return this.dataSource.fetchOne({ where: { id } });
  }

  async updatePrescription(id: string, data: Partial<IPrescriptionCreationBody>) {
    await this.dataSource.updateOne(data, { where: { id } });
  }

  async getAllPrescriptions() {
    return this.dataSource.fetchAll({});
  }
}

export { PrescriptionService };
```

### Controllers

#### prescription.controller.ts

```typescript
import { Request, Response } from "express";
import { PrescriptionService } from "../services/prescription.service";
import { Utility } from "../utility/utility";

class PrescriptionController {
  private prescriptionService: PrescriptionService;

  constructor(prescriptionService: PrescriptionService) {
    this.prescriptionService = prescriptionService;
  }

  createPrescription = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      Utility.validateRequest(body); // Use utility function for validation
      const prescription = await this.prescriptionService.createPrescription(body);
      res.status(201).json(prescription);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getPrescription = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const prescription = await this.prescriptionService.getPrescriptionById(id);
      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }
      res.status(200).json(prescription);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updatePrescription = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body = req.body;
      Utility.validateRequest(body); // Use utility function for validation
      await this.prescriptionService.updatePrescription(id, body);
      res.status(200).json({ message: "Prescription updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getAllPrescriptions = async (req: Request, res: Response) => {
    try {
      const prescriptions = await this.prescriptionService.getAllPrescriptions();
      res.status(200).json(prescriptions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export { PrescriptionController };
```

### medication.service.ts

```typescript
import { IMedicationDataSource, IMedicationCreationBody } from "../interfaces/consultation.interface";

class MedicationService {
  private dataSource: IMedicationDataSource;

  constructor(dataSource: IMedicationDataSource) {
    this.dataSource = dataSource;
  }

  async createMedication(record: IMedicationCreationBody) {
    return this.dataSource.create(record);
  }

  async getMedicationById(id: string) {
    return this.dataSource.fetchOne({ where: { id } });
  }

  async updateMedication(id: string, data: Partial<IMedicationCreationBody>) {
    await this.dataSource.updateOne(data, { where: { id } });
  }

  async getAllMedications() {
    return this.dataSource.fetchAll

({});
  }
}

export { MedicationService };
```

### Controllers

#### medication.controller.ts

```typescript
import { Request, Response } from "express";
import { MedicationService } from "../services/medication.service";
import { Utility } from "../utility/utility";

class MedicationController {
  private medicationService: MedicationService;

  constructor(medicationService: MedicationService) {
    this.medicationService = medicationService;
  }

  createMedication = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      Utility.validateRequest(body); // Use utility function for validation
      const medication = await this.medicationService.createMedication(body);
      res.status(201).json(medication);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getMedication = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const medication = await this.medicationService.getMedicationById(id);
      if (!medication) {
        return res.status(404).json({ error: "Medication not found" });
      }
      res.status(200).json(medication);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateMedication = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body = req.body;
      Utility.validateRequest(body); // Use utility function for validation
      await this.medicationService.updateMedication(id, body);
      res.status(200).json({ message: "Medication updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getAllMedications = async (req: Request, res: Response) => {
    try {
      const medications = await this.medicationService.getAllMedications();
      res.status(200).json(medications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export { MedicationController };
```

With this, we have complete models, data sources, services, and controllers. All the services are using the data sources to perform the database operations, and the controllers are using the services to handle HTTP requests. The `Utility.validateRequest` function is used to validate the request body in each controller method.