Sure, let's update the architecture to include the tests and their results, along with validation schemas and role-based access control. The structure will be similar to the existing code. We'll go through each part step-by-step:

1. **Interfaces**
2. **Enums**
3. **Models**
4. **DataSources**
5. **Services**
6. **Controllers**
7. **Validation Schemas**
8. **Routes**
9. **Role-based Access Control**

### Interfaces

#### `test.interface.ts`

```typescript
// interfaces/test.interface.ts
export interface ITest {
  id: string;
  consultationId: string;
  name: string;
  result?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITestCreationBody {
  consultationId: string;
  name: string;
  result?: string;
}

export interface ITestQuery {
  id?: string;
  consultationId?: string;
  name?: string;
}
```

### Enums

#### `interfaces.enum.ts`

```typescript
// interfaces/interfaces.enum.ts
export enum UserRole {
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
  ADMIN = "ADMIN",
}
```

### Models

#### `test.model.ts`

```typescript
// models/test.model.ts
import { DataTypes } from "sequelize";
import Db from "../database";
import { ITest } from "../interfaces/test.interface";
import ConsultationModel from "./consultation.model";
import { v4 as uuidv4 } from "uuid";

const TestModel = Db.define<ITest>(
  "TestModel",
  {
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
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    result: {
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
  },
  {
    timestamps: true,
    tableName: "tests",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

ConsultationModel.hasMany(TestModel, {
  foreignKey: "consultationId",
  as: "consultationTests",
});

TestModel.belongsTo(ConsultationModel, {
  foreignKey: "consultationId",
  as: "testConsultation",
});

export default TestModel;
```

### DataSources

#### `test.datasource.ts`

```typescript
// datasources/test.datasource.ts
import { ITest, ITestCreationBody, ITestQuery } from "../interfaces/test.interface";
import TestModel from "../models/test.model";

class TestDataSource {
  async create(record: ITestCreationBody): Promise<ITest> {
    return await TestModel.create(record);
  }

  async fetchOne(query: ITestQuery): Promise<ITest | null> {
    return await TestModel.findOne({ where: query });
  }

  async fetchAll(query: ITestQuery): Promise<ITest[]> {
    return await TestModel.findAll({ where: query });
  }

  async updateOne(id: string, data: Partial<ITest>): Promise<void> {
    await TestModel.update(data, { where: { id } });
  }

  async deleteOne(id: string): Promise<void> {
    await TestModel.destroy({ where: { id } });
  }
}

export default new TestDataSource();
```

### Services

#### `test.service.ts`

```typescript
// services/test.service.ts
import { ITest, ITestCreationBody, ITestQuery } from "../interfaces/test.interface";
import TestDataSource from "../datasources/test.datasource";

class TestService {
  async createTest(record: ITestCreationBody): Promise<ITest> {
    return await TestDataSource.create(record);
  }

  async getTest(query: ITestQuery): Promise<ITest | null> {
    return await TestDataSource.fetchOne(query);
  }

  async getAllTests(query: ITestQuery): Promise<ITest[]> {
    return await TestDataSource.fetchAll(query);
  }

  async updateTest(id: string, data: Partial<ITest>): Promise<void> {
    await TestDataSource.updateOne(id, data);
  }

  async deleteTest(id: string): Promise<void> {
    await TestDataSource.deleteOne(id);
  }
}

export default new TestService();
```

### Controllers

#### `test.controller.ts`

```typescript
// controllers/test.controller.ts
import { Request, Response } from "express";
import TestService from "../services/test.service";

class TestController {
  async createTest(req: Request, res: Response) {
    try {
      const test = await TestService.createTest(req.body);
      res.status(201).json(test);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTest(req: Request, res: Response) {
    try {
      const test = await TestService.getTest({ id: req.params.id });
      if (test) {
        res.status(200).json(test);
      } else {
        res.status(404).json({ error: "Test not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllTests(req: Request, res: Response) {
    try {
      const tests = await TestService.getAllTests({});
      res.status(200).json(tests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTest(req: Request, res: Response) {
    try {
      await TestService.updateTest(req.params.id, req.body);
      res.status(200).json({ message: "Test updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteTest(req: Request, res: Response) {
    try {
      await TestService.deleteTest(req.params.id);
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new TestController();
```

### Validation Schemas

#### `validation/test.validation.ts`

```typescript
// validation/test.validation.ts
import Joi from "joi";

export const createTestSchema = Joi.object({
  consultationId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  result: Joi.string().optional(),
});

export const updateTestSchema = Joi.object({
  name: Joi.string().optional(),
  result: Joi.string().optional(),
});
```

### Routes

#### `test.routes.ts`

```typescript
// routes/test.routes.ts
import { Router } from "express";
import TestController from "../controllers/test.controller";
import { validate } from "../middleware/validate.middleware";
import { createTestSchema, updateTestSchema } from "../validation/test.validation";

const router = Router();

router.post("/", validate(createTestSchema), TestController.createTest);
router.get("/:id", TestController.getTest);
router.get("/", TestController.getAllTests);
router.put("/:id", validate(updateTestSchema), TestController.updateTest);
router.delete("/:id", TestController.deleteTest);

export default router;
```

### Integrating Routes in `app.ts`

Finally, update the `app.ts` file to include the new routes:

```typescript
// app.ts
import express from "express";
import bodyParser from "body-parser";
import vitalSignRoutes from "./routes/vitalSign.routes";
import consultationRoutes from "./routes/consultation.routes";
import prescriptionRoutes from "./routes/prescription.routes";
import testRoutes from "./routes/test.routes";

const app = express();

app.use(bodyParser.json());

app.use("/api/vital-signs", vitalSignRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/tests", testRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Role-Based Access Control

To implement role-based access control, we'll update the middleware to check the user's role and ensure only the relevant users can perform specific actions. Here's an example middleware for role-based access control:

#### `middleware/auth.middleware.ts`

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../interfaces/interfaces.enum";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).

json({ error: "Access denied." });
    }
    next();
  };
};

export { authenticate, authorize };
```

#### Example Usage in Routes

```typescript
// routes/test.routes.ts
import { Router } from "express";
import TestController from "../controllers/test.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { createTestSchema, updateTestSchema } from "../validation/test.validation";
import { UserRole } from "../interfaces/interfaces.enum";

const router = Router();

router.post("/", authenticate, authorize([UserRole.DOCTOR]), validate(createTestSchema), TestController.createTest);
router.get("/:id", authenticate, authorize([UserRole.DOCTOR, UserRole.PATIENT]), TestController.getTest);
router.get("/", authenticate, authorize([UserRole.DOCTOR]), TestController.getAllTests);
router.put("/:id", authenticate, authorize([UserRole.DOCTOR]), validate(updateTestSchema), TestController.updateTest);
router.delete("/:id", authenticate, authorize([UserRole.DOCTOR]), TestController.deleteTest);

export default router;
```

This implementation ensures that only authenticated and authorized users can perform certain actions, enforcing role-based access control.

By completing these steps, we've added the test and results functionality to the existing application, including interfaces, enums, models, data sources, services, controllers, validation schemas, routes, and role-based access control. This provides a comprehensive system for managing medical consultations, prescriptions, and associated tests and results.