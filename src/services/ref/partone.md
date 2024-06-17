I apologize for the oversight. Let's integrate your initial design pattern with the extended functionality and ensure the complete implementation of the requested features, keeping the layered architecture approach in mind.

### Project Structure

src/
├── config/
│   └── database.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── doctor.controller.ts
│   └── patient.controller.ts
├── datasources/
│   ├── user.datasource.ts
│   ├── doctor.datasource.ts
│   ├── patient.datasource.ts
│   ├── appointment.datasource.ts
│   └── message.datasource.ts
├── interfaces/
│   ├── user.interface.ts
│   ├── doctor.interface.ts
│   ├── patient.interface.ts
│   ├── appointment.interface.ts
│   ├── prescription.interface.ts
│   ├── message.interface.ts
│   ├── post.interface.ts
│   └── enum/
│       └── user.enum.ts
├── middlewares/
│   ├── auth.middleware.ts
│   └── validator.middleware.ts
├── models/
│   ├── user.model.ts
│   ├── doctor.model.ts
│   ├── patient.model.ts
│   ├── appointment.model.ts
│   ├── prescription.model.ts
│   ├── message.model.ts
│   └── post.model.ts
├── routes/
│   ├── auth.routes.ts
│   ├── doctor.routes.ts
│   └── patient.routes.ts
├── services/
│   ├── auth.service.ts
│   ├── doctor.service.ts
│   ├── patient.service.ts
│   └── appointment.service.ts
└── validators/
    ├── user.validator.ts
    ├── doctor.validator.ts
    └── patient.validator.ts


### Database Configuration

#### config/database.ts
typescript
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const Db = new Sequelize(process.env.DATABASE_URL!, {
  dialect: "postgres",
  logging: false,
});

export default Db;


### Models

#### models/user.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { IUserModel } from "../interfaces/user.interface";
import { v4 as uuidv4 } from "uuid";

const UserModel = Db.define<IUserModel>("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
    allowNull: true,
  },
  isEmailVerified: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountStatus: {
    type: DataTypes.STRING,
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: UserModel,
      key: "id",
    },
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
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


### Interfaces

#### interfaces/user.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface IUser {
  id: string;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  isEmailVerified: string;
  accountStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFindUserQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning: boolean;
}

export interface IUserCreationBody extends Optional<IUser, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IUserModel extends Model<IUser, IUserCreationBody>, IUser {}

export interface IUserDataSource {
  fetchOne(query: IFindUserQuery): Promise<IUser | null>;
  create(record: IUserCreationBody): Promise<IUser>;
  updateOne(searchBy: IFindUserQuery, data: Partial<IUser>): Promise<void>;
}
```

#### interfaces/doctor.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface IDoctor {
  userId: string;
  specialization: string;
  verificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctorCreationBody extends Optional<IDoctor, 'createdAt' | 'updatedAt'> {}

export interface IDoctorModel extends Model<IDoctor, IDoctorCreationBody>, IDoctor {}

export interface IDoctorDataSource {
  fetchOne(query: IFindUserQuery): Promise<IDoctor | null>;
  create(record: IDoctorCreationBody): Promise<IDoctor>;
  updateOne(searchBy: IFindUserQuery, data: Partial<IDoctor>): Promise<void>;
}


#### interfaces/patient.interface.ts
typescript
import { Model, Optional } from "sequelize";

export interface IPatient {
  userId: string;
  age: number;
  gender: string;
  medicalHistory?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPatientCreationBody extends Optional<IPatient, 'createdAt' | 'updatedAt'> {}

export interface IPatientModel extends Model<IPatient, IPatientCreationBody>, IPatient {}

export interface IPatientDataSource {
  fetchOne(query: IFindUserQuery): Promise<IPatient | null>;
  create(record: IPatientCreationBody): Promise<IPatient>;
  updateOne(searchBy: IFindUserQuery, data: Partial<IPatient>): Promise<void>;
}
```

### Services

#### services/doctor.service.ts
```typescript
import { IDoctor, IDoctorDataSource, IDoctorCreationBody } from "../interfaces/doctor.interface";
import DoctorModel from "../models/doctor.model";

class DoctorDataSource implements IDoctorDataSource {
  async create(record: IDoctorCreationBody): Promise<IDoctor> {
    return await DoctorModel.create(record);
  }

  async fetchOne(query: IFindUserQuery): Promise<IDoctor | null> {
    return await DoctorModel.findOne(query);
  }

  async updateOne(searchBy: IFindUserQuery, data: Partial<IDoctor>): Promise<void> {
    await DoctorModel.update(data, searchBy);
  }
}

class DoctorService {
  private doctorDataSource: IDoctorDataSource;

  constructor(doctorDataSource: IDoctorDataSource) {
    this.doctorDataSource = doctorDataSource;
  }

  async createDoctor(record: IDoctorCreationBody): Promise<IDoctor
```