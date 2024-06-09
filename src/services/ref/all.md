For handling role-based access control (RBAC) in your application, you can use a combination of middleware and user roles defined in your system. You also need to extend the user model to include specific information for doctors, patients, nurses, etc. Here's a step-by-step guide on how to implement RBAC and extend user models with inheritance.

### Step 1: Extend User Models

First, let's create models for doctors, patients, and other user types. We'll use inheritance to extend the base user model.

#### 1.1 Base User Model

```typescript
// src/models/user.model.ts
import { DataTypes } from 'sequelize';
import Db from '../config/database';
import { IUserModel } from '../interfaces/user.interfaces';
import { v4 as uuidv4 } from 'uuid';

const UserModel = Db.define<IUserModel>('UserModel', {
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
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default UserModel;
```

#### 1.2 Doctor Model

```typescript
// src/models/doctor.model.ts
import { DataTypes } from 'sequelize';
import UserModel from './user.model';

const DoctorModel = UserModel.extend('DoctorModel', {
  specialty: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default DoctorModel;
```

#### 1.3 Patient Model

```typescript
// src/models/patient.model.ts
import { DataTypes } from 'sequelize';
import UserModel from './user.model';

const PatientModel = UserModel.extend('PatientModel', {
  medicalHistory: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  currentMedications: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export default PatientModel;
```

#### 1.4 Nurse Model

```typescript
// src/models/nurse.model.ts
import { DataTypes } from 'sequelize';
import UserModel from './user.model';

const NurseModel = UserModel.extend('NurseModel', {
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default NurseModel;
```

### Step 2: Role-Based Access Control Middleware

Next, let's create middleware to check for user roles and permissions.

#### 2.1 Middleware

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';

const authMiddleware = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
      const user = await UserModel.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
};

export default authMiddleware;
```

### Step 3: Using the Middleware in Routes

Use the `authMiddleware` in your routes to restrict access based on roles.

#### 3.1 Example Routes

```typescript
// src/routes/user.router.ts
import express from 'express';
import UserController from '../controllers/user.controller';
import TokenDataSource from '../datasources/token.datasource';
import UserDataSource from '../datasources/user.datasource';
import { validator } from '../middlewares/index.middlewares';
import TokenService from '../services/token.service';
import UserService from '../services/user.services';
import validationSchema from '../validators/user.validator.schema';
import authMiddleware from '../middleware/auth';
import { UserRoles } from '../interfaces/enum/user.enum';

const createUserRoute = () => {
  const router = express.Router();
  const userService = new UserService(new UserDataSource());
  const tokenService = new TokenService(new TokenDataSource());
  const userController = new UserController(userService, tokenService);

  router.post(
    '/register',
    validator(validationSchema.registrationSchema),
    (req, res) => userController.register(req, res)
  );

  router.post(
    '/login',
    validator(validationSchema.loginSchema),
    (req, res) => userController.login(req, res)
  );

  router.get(
    '/profile',
    authMiddleware([UserRoles.CUSTOMER, UserRoles.DOCTOR, UserRoles.NURSE]),
    (req, res) => userController.getProfile(req, res)
  );

  router.post(
    '/doctor/appointments',
    authMiddleware([UserRoles.DOCTOR]),
    (req, res) => userController.createAppointment(req, res)
  );

  return router;
};

export default createUserRoute;
```

### Step 4: Polymorphism in Services

Using inheritance to extend the base user model is an example of polymorphism. Each specific user type (Doctor, Patient, Nurse) is a variation of the base User but with additional attributes.

### Summary

- **Inheritance**: Used to create specific user models (Doctor, Patient, Nurse) that extend the base user model.
- **Middleware**: Used to implement role-based access control by checking the user's role before allowing access to certain routes.
- **Polymorphism**: Allows treating different user types uniformly while handling their specific attributes.

This approach keeps your code organized, reusable, and easy to maintain, while ensuring that only authorized users can access specific features.