Sure, let's break down how role-based access control (RBAC) works in this context, given the different types of users (e.g., doctors, patients, nurses) and the additional information that needs to be stored for each type.

### Overview of Role-Based Access Control (RBAC)

RBAC ensures that users can only access resources and perform actions according to their roles. Here's how it works in this application:

1. **Authentication**: Verify the user's identity and issue a JWT token containing the user's role.
2. **Authorization**: Use middleware to check the user's role before allowing access to certain routes or performing certain actions.

### Step-by-Step Process

#### 1. Authentication
- **User Login**: When a user logs in, their credentials are verified against the stored user records.
- **Token Generation**: If the credentials are correct, a JWT token is generated, containing the user's ID and role. This token is then used for subsequent requests to authenticate the user.

#### 2. Storing Extra Information
- **User Model**: The `User` model handles common attributes for all users (e.g., `id`, `username`, `password`, `email`, `role`, etc.).
- **Doctor and Patient Models**: Separate models are created to store additional information specific to doctors and patients.

#### 3. Handling Extra Information
- **Associations**: Define relationships between the `User` model and the additional models (`Doctor` and `Patient`). Use foreign keys to link these models.
- **Data Storage**: When a doctor or patient registers, their specific information is stored in the corresponding models.

### Implementation Details

#### 1. Models

##### user.model.ts
This model remains as it is, storing common user information.

```typescript
// user.model.ts
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { IUserModel } from "../interfaces/user.interfaces";

const UserModel = Db.define<IUserModel>("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // other common fields...
}, {
  timestamps: true,
  tableName: 'users',
});

export default UserModel;
```

##### doctor.model.ts
This model stores additional information specific to doctors.

```typescript
// doctor.model.ts
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { IDoctorModel } from "../interfaces/doctor.interfaces";
import UserModel from "./user.model";

const DoctorModel = Db.define<IDoctorModel>("Doctor", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
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
  // other doctor-specific fields...
}, {
  timestamps: true,
  tableName: 'doctors',
});

export default DoctorModel;
```

##### patient.model.ts
This model stores additional information specific to patients.

```typescript
// patient.model.ts
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { IPatientModel } from "../interfaces/patient.interfaces";
import UserModel from "./user.model";

const PatientModel = Db.define<IPatientModel>("Patient", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
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
  // other patient-specific fields...
}, {
  timestamps: true,
  tableName: 'patients',
});

export default PatientModel;
```

#### 2. Associations

Set up associations between the `User`, `Doctor`, and `Patient` models in your `database` configuration.

```typescript
// database.ts
import UserModel from "./models/user.model";
import DoctorModel from "./models/doctor.model";
import PatientModel from "./models/patient.model";

// Associations
UserModel.hasOne(DoctorModel, { foreignKey: "userId", as: "doctor" });
UserModel.hasOne(PatientModel, { foreignKey: "userId", as: "patient" });
DoctorModel.belongsTo(UserModel, { foreignKey: "userId" });
PatientModel.belongsTo(UserModel, { foreignKey: "userId" });

export default {
  UserModel,
  DoctorModel,
  PatientModel,
  // other models...
};
```

#### 3. Middleware

Implement middleware to check authentication and authorization.

```typescript
// auth.middlewares.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ResponseCode } from "../interfaces/enum/code.enum";
import Utility from "../utils/index.utils";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return Utility.handleError(res, "Unauthorized", ResponseCode.UNAUTHORIZED);
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      return Utility.handleError(res, "Unauthorized", ResponseCode.UNAUTHORIZED);
    }

    req.user = user;
    next();
  });
};

export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return Utility.handleError(res, "Forbidden", ResponseCode.FORBIDDEN);
    }
    next();
  };
};
```

#### 4. Routes

Define routes for doctor-specific actions, using the middleware for authentication and authorization.

```typescript
// doctor.routes.ts
import express, { Request, Response } from "express";
import DoctorController from "../controllers/doctor.controller";
import DoctorService from "../services/doctor.service";
import DoctorDataSource from "../datasources/doctor.datasource";
import UserDataSource from "../datasources/user.datasource";
import { isAuthenticated, hasRole } from "../middlewares/auth.middlewares";

const createDoctorRoute = () => {
  const router = express.Router();
  const doctorService = new DoctorService(new UserDataSource(), new DoctorDataSource());
  const doctorController = new DoctorController(doctorService);

  router.get("/appointments", isAuthenticated, hasRole(["DOCTOR"]), (req: Request, res: Response) => {
    return doctorController.getAppointments(req, res);
  });

  router.get("/patient/:patientId/record", isAuthenticated, hasRole(["DOCTOR"]), (req: Request, res: Response) => {
    return doctorController.viewPatientRecord(req, res);
  });

  router.post("/patient/:patientId/prescribe", isAuthenticated, hasRole(["DOCTOR"]), (req: Request, res: Response) => {
    return doctorController.prescribeMedication(req, res);
  });

  router.post("/appointments", isAuthenticated, hasRole(["DOCTOR"]), (req: Request, res: Response) => {
    return doctorController.createAppointment(req, res);
  });

  return router;
};

export default createDoctorRoute;
```

### Summary

1. **User Authentication**: Users log in and receive a JWT token containing their role.
2. **Role-based Access**: Middleware checks the user's role before allowing access to specific routes.
3. **Storing Extra Information**: Additional models (Doctor, Patient) store extra information specific to each user type.
4. **Associations**: Relationships between the `User` model and the `Doctor`/`Patient` models ensure data integrity and easy retrieval of related information.

This approach ensures that each user type has access only to the resources and actions they are authorized for, while also properly storing and associating additional data relevant to their role.