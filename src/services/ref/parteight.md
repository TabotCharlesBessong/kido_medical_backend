Yes, maintaining relationships between tables in the database is crucial for ensuring data integrity and proper functioning of the application. We'll use Sequelize to define these relationships, ensuring that our models reflect the necessary associations.

Here's how you can set up and maintain relationships between tables for users, doctors, patients, appointments, consultations, prescriptions, and messages.

### Step 1: Define the Models with Relationships

#### models/user.model.ts
typescript
import { DataTypes, Model, Sequelize } from 'sequelize';
import Db from '../database';
import { IUserModel } from '../interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';

const UserModel = Db.define<IUserModel>('User', {
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
    allowNull: false,
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
  tableName: 'users',
});

export default UserModel;


#### models/doctor.model.ts
typescript
import { DataTypes, Model, Sequelize } from 'sequelize';
import Db from '../database';
import UserModel from './user.model';
import { v4 as uuidv4 } from 'uuid';

const DoctorModel = Db.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: UserModel,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verificationStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  documents: {
    type: DataTypes.STRING, // You might want to store the documents as JSON or in a separate table
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
  tableName: 'doctors',
});

DoctorModel.belongsTo(UserModel, { foreignKey: 'userId' });
UserModel.hasOne(DoctorModel, { foreignKey: 'userId' });

export default DoctorModel;


#### models/patient.model.ts
typescript
import { DataTypes, Model, Sequelize } from 'sequelize';
import Db from '../database';
import UserModel from './user.model';
import DoctorModel from './doctor.model';
import { v4 as uuidv4 } from 'uuid';

const PatientModel = Db.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: UserModel,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  medicalHistory: {
    type: DataTypes.STRING, // You might want to store the medical history as JSON
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
  tableName: 'patients',
});

PatientModel.belongsTo(UserModel, { foreignKey: 'userId' });
UserModel.hasOne(PatientModel, { foreignKey: 'userId' });

export default PatientModel;


### Step 2: Define Associations for Appointments, Consultations, Prescriptions, and Messages

#### models/appointment.model.ts
typescript
import { DataTypes, Model, Sequelize } from 'sequelize';
import Db from '../database';
import DoctorModel from './doctor.model';
import PatientModel from './patient.model';
import { v4 as uuidv4 } from 'uuid';

const AppointmentModel = Db.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: DoctorModel,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: PatientModel,
      key: 'id',
    },
    onDelete: 'CASCADE',
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
    allowNull: true,
  },
  status: {
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

AppointmentModel.belongsTo(DoctorModel, { foreignKey: 'doctorId' });
AppointmentModel.belongsTo(PatientModel, { foreignKey: 'patientId' });
DoctorModel.hasMany(AppointmentModel, { foreignKey: 'doctorId' });
PatientModel.hasMany(AppointmentModel, { foreignKey: 'patientId' });

export default AppointmentModel;


#### models/consultation.model.ts
typescript
import { DataTypes, Model, Sequelize } from 'sequelize';
import Db from '../database';
import AppointmentModel from './appointment.model';
import { v4 as uuidv4 } from 'uuid';

const ConsultationModel = Db.define('Consultation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: AppointmentModel,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  notes: {
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
  tableName: 'consultations',
});

ConsultationModel.belongsTo(AppointmentModel, { foreignKey: 'appointmentId' });
AppointmentModel.hasOne(ConsultationModel, { foreignKey: 'appointmentId' });

export default ConsultationModel;


#### models/prescription.model.ts
```typescript
import { DataTypes, Model, Sequelize } from 'sequelize';
import Db from '../database';
import ConsultationModel from './consultation.model';
import { v4 as uuidv4 } from 'uuid';

const PrescriptionModel = Db.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  consultationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: ConsultationModel,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  medication: {
    type: DataTypes.STRING, // This could be stored as JSON if you want multiple medications
    allowNull: false,
  },
  tests: {
    type: DataTypes.STRING, // This could be stored as JSON if you want multiple tests
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
  tableName: 'prescriptions',
});

PrescriptionModel