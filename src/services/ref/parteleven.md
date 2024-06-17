Certainly! Let's create the data sources and enums for all the models and interfaces we've discussed.

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
};

export const AccountStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
};

export const AppointmentStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
};
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
  returning?: boolean;
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
  id: string;
  userId: string;
  specialization: string;
  verificationStatus: string;
  documents: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFindDoctorQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}

export interface IDoctorCreationBody extends Optional<IDoctor, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IDoctorModel extends Model<IDoctor, IDoctorCreationBody>, IDoctor {}

export interface IDoctorDataSource {
  fetchOne(query: IFindDoctorQuery): Promise<IDoctor | null>;
  create(record: IDoctorCreationBody): Promise<IDoctor>;
  updateOne(searchBy: IFindDoctorQuery, data: Partial<IDoctor>): Promise<void>;
}
```

#### interfaces/patient.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface IPatient {
  id: string;
  userId: string;
  medicalHistory: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFindPatientQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}

export interface IPatientCreationBody extends Optional<IPatient, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IPatientModel extends Model<IPatient, IPatientCreationBody>, IPatient {}

export interface IPatientDataSource {
  fetchOne(query: IFindPatientQuery): Promise<IPatient | null>;
  create(record: IPatientCreationBody): Promise<IPatient>;
  updateOne(searchBy: IFindPatientQuery, data: Partial<IPatient>): Promise<void>;
}
```

#### interfaces/appointment.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface IAppointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: Date;
  timeSlot: string;
  reason: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFindAppointmentQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}

export interface IAppointmentCreationBody extends Optional<IAppointment, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IAppointmentModel extends Model<IAppointment, IAppointmentCreationBody>, IAppointment {}

export interface IAppointmentDataSource {
  fetchOne(query: IFindAppointmentQuery): Promise<IAppointment | null>;
  create(record: IAppointmentCreationBody): Promise<IAppointment>;
  updateOne(searchBy: IFindAppointmentQuery, data: Partial<IAppointment>): Promise<void>;
}
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
import { IFindDoctorQuery, IDoctor, IDoctorCreationBody, IDoctorDataSource } from "../interfaces/doctor.interface";
import DoctorModel from "../models/doctor.model";

class DoctorDataSource implements IDoctorDataSource {
  async create(record: IDoctorCreationBody): Promise<IDoctor> {
    return await DoctorModel.create(record);
  }

  async fetchOne(query: IFindDoctorQuery): Promise<IDoctor | null> {
    return await DoctorModel.findOne(query);
  }

  async updateOne(searchBy: IFindDoctorQuery, data: Partial<IDoctor>): Promise<void> {
    await DoctorModel.update(data, searchBy);
  }
}

export default DoctorDataSource;
```

#### datasources/patient.datasource.ts
```typescript
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

#### datasources/appointment.datasource.ts
```typescript
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

### Services

#### services/user.service.ts
```typescript
import { IFindUserQuery, IUser, IUserCreationBody, IUserDataSource } from "../interfaces/user.interface";

class UserService {
  private userDataSource: IUserDataSource;

  constructor(_userDataSource: IUserDataSource) {
    this.userDataSource = _userDataSource;
  }

  async getUserByField(record: Partial<IUser>): Promise<IUser | null> {
    const query = { where: { ...record }, raw: true } as IFindUserQuery;
    return this.userDataSource.fetchOne(query);
  }

  async createUser(record: IUserCreationBody) {
    return this.userDataSource.create(record);
  }

  async updateRecord(searchBy: Partial<IUser>, record: Partial<IUser>): Promise<void> {
    const query = { where: { ...searchBy } } as IFindUserQuery;
    await this.userDataSource.updateOne(query, record);
  }
}

export default UserService;
```

#### services/doctor.service.ts
```typescript
import { IFindDoctorQuery, IDoctor, IDoctorCreationBody, IDoctorDataSource } from "../interfaces/doctor.interface";

class DoctorService {
  private doctorDataSource: IDoctorDataSource;

  constructor(_doctorDataSource: IDoctorDataSource) {
    this.doctorDataSource = _doctorDataSource;
  }

  async getDoctorByField(record: Partial<IDoctor>): Promise<IDoctor | null> {
    const query = { where: { ...record }, raw: true } as IFindDoctorQuery;
    return this.doctorDataSource.fetchOne(query);
  }

  async createDoctor(record: IDoctorCreationBody) {
    return this.doctorDataSource.create(record);
  }

  async updateRecord(searchBy: Partial<IDoctor>, record: Partial<IDoctor>): Promise<void> {
    const query = { where: { ...searchBy } } as IFindDoctorQuery;
    await this.doctorDataSource.updateOne(query, record

);
  }
}

export default DoctorService;
```

#### services/patient.service.ts
```typescript
import { IFindPatientQuery, IPatient, IPatientCreationBody, IPatientDataSource } from "../interfaces/patient.interface";

class PatientService {
  private patientDataSource: IPatientDataSource;

  constructor(_patientDataSource: IPatientDataSource) {
    this.patientDataSource = _patientDataSource;
  }

  async getPatientByField(record: Partial<IPatient>): Promise<IPatient | null> {
    const query = { where: { ...record }, raw: true } as IFindPatientQuery;
    return this.patientDataSource.fetchOne(query);
  }

  async createPatient(record: IPatientCreationBody) {
    return this.patientDataSource.create(record);
  }

  async updateRecord(searchBy: Partial<IPatient>, record: Partial<IPatient>): Promise<void> {
    const query = { where: { ...searchBy } } as IFindPatientQuery;
    await this.patientDataSource.updateOne(query, record);
  }
}

export default PatientService;
```

#### services/appointment.service.ts
```typescript
import { IFindAppointmentQuery, IAppointment, IAppointmentCreationBody, IAppointmentDataSource } from "../interfaces/appointment.interface";

class AppointmentService {
  private appointmentDataSource: IAppointmentDataSource;

  constructor(_appointmentDataSource: IAppointmentDataSource) {
    this.appointmentDataSource = _appointmentDataSource;
  }

  async getAppointmentByField(record: Partial<IAppointment>): Promise<IAppointment | null> {
    const query = { where: { ...record }, raw: true } as IFindAppointmentQuery;
    return this.appointmentDataSource.fetchOne(query);
  }

  async createAppointment(record: IAppointmentCreationBody) {
    return this.appointmentDataSource.create(record);
  }

  async updateRecord(searchBy: Partial<IAppointment>, record: Partial<IAppointment>): Promise<void> {
    const query = { where: { ...searchBy } } as IFindAppointmentQuery;
    await this.appointmentDataSource.updateOne(query, record);
  }
}

export default AppointmentService;
```

These code snippets include the necessary data sources, services, and enums for the models, ensuring proper relationships between them. Each data source and service is designed to handle CRUD operations and maintain data integrity.

Feel free to integrate the above code into your existing application, ensuring to adjust any configurations or dependencies as needed. If you need further assistance or more specific functionalities, please let me know!