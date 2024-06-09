
```typescript
// src/models/doctor.model.ts
import { DataTypes, Model } from 'sequelize';
import UserModel from './user.model';
import Db from '../config/database';

interface DoctorAttributes extends UserAttributes {
  specialty: string;
  licenseNumber: string;
  clinicAffiliation: string;
  appointmentSchedules: string[];
}

class DoctorModel extends UserModel implements DoctorAttributes {}

DoctorModel.init(
  {
    ...UserModel.initAttributes,
    specialty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clinicAffiliation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appointmentSchedules: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  },
  {
    sequelize: Db,
    modelName: 'DoctorModel',
    tableName: 'doctors',
  }
);

export default DoctorModel;
```

```typescript
// src/models/patient.model.ts
import { DataTypes, Model } from 'sequelize';
import UserModel from './user.model';
import Db from '../config/database';

interface PatientAttributes extends UserAttributes {
  medicalHistory: string | null;
  currentMedications: string | null;
  allergies: string[];
  insuranceDetails: {
    provider: string;
    policyNumber: string;
  };
}

class PatientModel extends UserModel implements PatientAttributes {}

PatientModel.init(
  {
    ...UserModel.initAttributes,
    medicalHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    currentMedications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    allergies: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    insuranceDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize: Db,
    modelName: 'PatientModel',
    tableName: 'patients',
  }
);

export default PatientModel;
```

```typescript
// src/models/nurse.model.ts
import { DataTypes, Model } from 'sequelize';
import UserModel from './user.model';
import Db from '../config/database';

interface NurseAttributes extends UserAttributes {
  department: string;
  workShifts: string[];
  assignedDoctors: string[];
}

class NurseModel extends UserModel implements NurseAttributes {}

NurseModel.init(
  {
    ...UserModel.initAttributes,
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workShifts: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    assignedDoctors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  },
  {
    sequelize: Db,
    modelName: 'NurseModel',
    tableName: 'nurses',
  }
);

export default NurseModel;
```

In these updated models, I have included the following additional information:

- `DoctorModel`: `clinicAffiliation` (string) and `appointmentSchedules` (string array).
- `PatientModel`: `allergies` (string array) and `insuranceDetails` (object with `provider` and `policyNumber` properties).
- `NurseModel`: `workShifts` (string array) and `assignedDoctors` (string array).

These changes reflect the specific information you mentioned for each role in the telemedicine application.