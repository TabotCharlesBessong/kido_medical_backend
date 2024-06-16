Sure, let's integrate the `Prescription`, `Medication`, and `TestResult` entities into the system. We'll add their interfaces, models, data sources, and enums.

### Enums

#### interfaces/enum/user.enum.ts
```typescript
export const EmailStatus = {
  VERIFIED: "VERIFIED",
  NOT_VERIFIED: "NOT_VERIFIED",
};

export const UserRoles = {
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  PATIENT: "PATIENT",
  NURSE: "NURSE",
  LAB_TECHNICIAN: "LAB_TECHNICIAN",
};

export const AccountStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
};

export const AppointmentStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
};

export const PrescriptionStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const TestResultStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
};
```

### Interfaces

#### interfaces/prescription.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface IPrescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescriptionCreationBody extends Optional<IPrescription, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IPrescriptionModel extends Model<IPrescription, IPrescriptionCreationBody>, IPrescription {}

export interface IPrescriptionDataSource {
  create(record: IPrescriptionCreationBody): Promise<IPrescription>;
  fetchOne(query: any): Promise<IPrescription | null>;
  updateOne(searchBy: any, data: Partial<IPrescription>): Promise<void>;
}
```

#### interfaces/medication.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface IMedication {
  id: string;
  prescriptionId: string;
  name: string;
  dosage: string;
  frequency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedicationCreationBody extends Optional<IMedication, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IMedicationModel extends Model<IMedication, IMedicationCreationBody>, IMedication {}

export interface IMedicationDataSource {
  create(record: IMedicationCreationBody): Promise<IMedication>;
  fetchOne(query: any): Promise<IMedication | null>;
  updateOne(searchBy: any, data: Partial<IMedication>): Promise<void>;
}
```

#### interfaces/testResult.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface ITestResult {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  testName: string;
  result: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITestResultCreationBody extends Optional<ITestResult, 'id' | 'createdAt' | 'updatedAt'> {}

export interface ITestResultModel extends Model<ITestResult, ITestResultCreationBody>, ITestResult {}

export interface ITestResultDataSource {
  create(record: ITestResultCreationBody): Promise<ITestResult>;
  fetchOne(query: any): Promise<ITestResult | null>;
  updateOne(searchBy: any, data: Partial<ITestResult>): Promise<void>;
}
```

### Models

#### models/prescription.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import AppointmentModel from "./appointment.model";
import DoctorModel from "./doctor.model";
import PatientModel from "./patient.model";
import { IPrescriptionModel } from "../interfaces/prescription.interface";

const PrescriptionModel = Db.define<IPrescriptionModel>("Prescription", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: AppointmentModel,
      key: "id",
    },
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: DoctorModel,
      key: "id",
    },
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: PatientModel,
      key: "id",
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "ACTIVE",
  },
}, {
  timestamps: true,
  tableName: "prescriptions",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

AppointmentModel.hasOne(PrescriptionModel, {
  foreignKey: "appointmentId",
  as: "prescription",
});
PrescriptionModel.belongsTo(AppointmentModel, {
  foreignKey: "appointmentId",
});

DoctorModel.hasMany(PrescriptionModel, {
  foreignKey: "doctorId",
  as: "prescriptions",
});
PrescriptionModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
});

PatientModel.hasMany(PrescriptionModel, {
  foreignKey: "patientId",
  as: "prescriptions",
});
PrescriptionModel.belongsTo(PatientModel, {
  foreignKey: "patientId",
});

export default PrescriptionModel;
```

#### models/medication.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import PrescriptionModel from "./prescription.model";
import { IMedicationModel } from "../interfaces/medication.interface";

const MedicationModel = Db.define<IMedicationModel>("Medication", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  prescriptionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: PrescriptionModel,
      key: "id",
    },
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
}, {
  timestamps: true,
  tableName: "medications",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

PrescriptionModel.hasMany(MedicationModel, {
  foreignKey: "prescriptionId",
  as: "medications",
});
MedicationModel.belongsTo(PrescriptionModel, {
  foreignKey: "prescriptionId",
});

export default MedicationModel;
```

#### models/testResult.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import AppointmentModel from "./appointment.model";
import DoctorModel from "./doctor.model";
import PatientModel from "./patient.model";
import { ITestResultModel } from "../interfaces/testResult.interface";

const TestResultModel = Db.define<ITestResultModel>("TestResult", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: AppointmentModel,
      key: "id",
    },
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: DoctorModel,
      key: "id",
    },
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: PatientModel,
      key: "id",
    },
  },
  testName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  result: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "PENDING",
  },
}, {
  timestamps: true,
  tableName: "testResults",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

AppointmentModel.hasOne(TestResultModel, {
  foreignKey: "appointmentId",
  as: "testResult",
});
TestResultModel.belongsTo(AppointmentModel, {
  foreignKey: "appointmentId",
});

DoctorModel.hasMany(TestResultModel, {
  foreignKey: "doctorId",
  as: "testResults",
});
TestResultModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
});

PatientModel.hasMany(TestResultModel, {
  foreignKey: "patientId",
  as: "testResults",
});
TestResultModel.belongsTo(PatientModel, {
  foreignKey: "patientId",
});

export default TestResultModel;
```

### Data Sources

#### datasources/prescription.datasource.ts
```typescript
import { IPrescription, IPrescriptionCreationBody, IPrescriptionDataSource } from "../interfaces/prescription.interface";
import PrescriptionModel from "../models/prescription.model";

class PrescriptionDataSource implements IPrescriptionDataSource {
  async create(record: IPrescriptionCreationBody): Promise<IPrescription> {
    return await PrescriptionModel.create(record);
  }

  async fetchOne(query: any

): Promise<IPrescription | null> {
    return await PrescriptionModel.findOne(query);
  }

  async updateOne(searchBy: any, data: Partial<IPrescription>): Promise<void> {
    await PrescriptionModel.update(data, searchBy);
  }
}

export default PrescriptionDataSource;
```

#### datasources/medication.datasource.ts
```typescript
import { IMedication, IMedicationCreationBody, IMedicationDataSource } from "../interfaces/medication.interface";
import MedicationModel from "../models/medication.model";

class MedicationDataSource implements IMedicationDataSource {
  async create(record: IMedicationCreationBody): Promise<IMedication> {
    return await MedicationModel.create(record);
  }

  async fetchOne(query: any): Promise<IMedication | null> {
    return await MedicationModel.findOne(query);
  }

  async updateOne(searchBy: any, data: Partial<IMedication>): Promise<void> {
    await MedicationModel.update(data, searchBy);
  }
}

export default MedicationDataSource;
```

#### datasources/testResult.datasource.ts
```typescript
import { ITestResult, ITestResultCreationBody, ITestResultDataSource } from "../interfaces/testResult.interface";
import TestResultModel from "../models/testResult.model";

class TestResultDataSource implements ITestResultDataSource {
  async create(record: ITestResultCreationBody): Promise<ITestResult> {
    return await TestResultModel.create(record);
  }

  async fetchOne(query: any): Promise<ITestResult | null> {
    return await TestResultModel.findOne(query);
  }

  async updateOne(searchBy: any, data: Partial<ITestResult>): Promise<void> {
    await TestResultModel.update(data, searchBy);
  }
}

export default TestResultDataSource;
```

These additions ensure that all the necessary tables and relationships are defined, and the corresponding data sources, models, and interfaces are properly integrated into the existing system. This will allow you to manage prescriptions, medications, and test results effectively.