I understand the format you prefer. Let's update the models using that format, along with their corresponding data sources and enums.

### Updated Models

#### models/user.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { IUserModel } from "../interfaces/user.interface";

const UserModel = Db.define<IUserModel>("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "PATIENT",
  },
  isEmailVerified: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "NOT_VERIFIED",
  },
  accountStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "ACTIVE",
  },
}, {
  timestamps: true,
  tableName: "users",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

export default UserModel;
```

#### models/doctor.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import UserModel from "./user.model";
import { IDoctorModel } from "../interfaces/doctor.interface";

const DoctorModel = Db.define<IDoctorModel>("Doctor", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: UserModel,
      key: "id",
    },
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verificationStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "PENDING",
  },
  documents: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: "doctors",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

UserModel.hasOne(DoctorModel, {
  foreignKey: "userId",
  as: "doctor",
});
DoctorModel.belongsTo(UserModel, {
  foreignKey: "userId",
});

export default DoctorModel;
```

#### models/patient.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import UserModel from "./user.model";
import { IPatientModel } from "../interfaces/patient.interface";

const PatientModel = Db.define<IPatientModel>("Patient", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: UserModel,
      key: "id",
    },
  },
  medicalHistory: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: "patients",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

UserModel.hasOne(PatientModel, {
  foreignKey: "userId",
  as: "patient",
});
PatientModel.belongsTo(UserModel, {
  foreignKey: "userId",
});

export default PatientModel;
```

#### models/appointment.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import DoctorModel from "./doctor.model";
import PatientModel from "./patient.model";
import { IAppointmentModel } from "../interfaces/appointment.interface";
import { AppointmentStatus } from "../interfaces/enum/user.enum";

const AppointmentModel = Db.define<IAppointmentModel>("Appointment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: AppointmentStatus.PENDING,
  },
}, {
  timestamps: true,
  tableName: "appointments",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

DoctorModel.hasMany(AppointmentModel, {
  foreignKey: "doctorId",
  as: "appointments",
});
AppointmentModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
  as: "doctor",
});

PatientModel.hasMany(AppointmentModel, {
  foreignKey: "patientId",
  as: "appointments",
});
AppointmentModel.belongsTo(PatientModel, {
  foreignKey: "patientId",
  as: "patient",
});

export default AppointmentModel;
```

### Data Sources

#### datasources/user.datasource.ts
```typescript
import { IFindUserQuery, IUser, IUserCreationBody, IUserDataSource } from "../interfaces/user.interface";
import UserModel from "../models/user.model";

class UserDataSource implements IUserDataSource {
  async create(record: IUserCreationBody): Promise<IUser> {
    return await UserModel.create(record);
  }

  async fetchOne(query: IFindUserQuery): Promise<IUser | null> {
    return await UserModel.findOne(query);
  }

  async updateOne(searchBy: IFindUserQuery, data: Partial<IUser>): Promise<void> {
    await UserModel.update(data, searchBy);
  }
}

export default UserDataSource;
```

#### datasources/doctor.datasource.ts
```typescript
import { IDoctor, IDoctorCreationBody, IDoctorDataSource } from "../interfaces/doctor.interface";
import DoctorModel from "../models/doctor.model";

class DoctorDataSource implements IDoctorDataSource {
  async create(record: IDoctorCreationBody): Promise<IDoctor> {
    return await DoctorModel.create(record);
  }

  async fetchOne(query: any): Promise<IDoctor | null> {
    return await DoctorModel.findOne(query);
  }

  async updateOne(searchBy: any, data: Partial<IDoctor>): Promise<void> {
    await DoctorModel.update(data, searchBy);
  }
}

export default DoctorDataSource;
```

#### datasources/patient.datasource.ts
```typescript
import { IPatient, IPatientCreationBody, IPatientDataSource } from "../interfaces/patient.interface";
import PatientModel from "../models/patient.model";

class PatientDataSource implements IPatientDataSource {
  async create(record: IPatientCreationBody): Promise<IPatient> {
    return await PatientModel.create(record);
  }

  async fetchOne(query: any): Promise<IPatient | null> {
    return await PatientModel.findOne(query);
  }

  async updateOne(searchBy: any, data: Partial<IPatient>): Promise<void> {
    await PatientModel.update(data, searchBy);
  }
}

export default PatientDataSource;
```

#### datasources/appointment.datasource.ts
```typescript
import { IAppointment, IAppointmentCreationBody, IAppointmentDataSource } from "../interfaces/appointment.interface";
import AppointmentModel from "../models/appointment.model";

class AppointmentDataSource implements IAppointmentDataSource {
  async create(record: IAppointmentCreationBody): Promise<IAppointment> {
    return await AppointmentModel.create(record);
  }

  async fetchOne(query: any): Promise<IAppointment | null> {
    return await AppointmentModel.findOne(query);
  }

  async updateOne(searchBy: any, data: Partial<IAppointment>): Promise<void> {
    await AppointmentModel.update(data, searchBy);
  }
}

export default AppointmentDataSource;
```

These updated models and data sources align with the structure you've been using. They also include relationships between models and reference IDs for proper associations.