Sure, let's go step-by-step to integrate the `TimeSlot` functionality into the existing application. Here's how you can implement it:

### 1. Timeslot Table Schema

The `TimeSlot` table will contain the following information:

- **doctorId**: The ID of the doctor.
- **startTime**: The start time of the time slot.
- **endTime**: The end time of the time slot.
- **isAvailable**: A boolean indicating whether the slot is available or not.

### 2. Interface Definition

Create the interface for `TimeSlot` and its creation body.

#### interfaces/timeslot.interface.ts

```typescript
export interface ITimeSlot {
  id: string;
  doctorId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeSlotCreationBody {
  doctorId: string;
  startTime: Date;
  endTime: Date;
  isAvailable?: boolean;
}
```

### 3. Enum Definition

Define the status for the time slot.

#### enums/timeslot.enum.ts

```typescript
export const TimeSlotStatus = {
  AVAILABLE: "AVAILABLE",
  UNAVAILABLE: "UNAVAILABLE",
} as const;

export type TimeSlotStatus = typeof TimeSlotStatus[keyof typeof TimeSlotStatus];
```

### 4. Data Source Layer

Implement the data source for `TimeSlot`.

#### datasources/timeslot.datasource.ts

```typescript
import { ITimeSlotDataSource, ITimeSlotCreationBody, ITimeSlot } from "../interfaces/timeslot.interface";
import TimeSlotModel from "../models/timeslot.model";

class TimeSlotDataSource implements ITimeSlotDataSource {
  async createTimeSlot(data: ITimeSlotCreationBody): Promise<ITimeSlot> {
    return await TimeSlotModel.create(data);
  }

  async getTimeSlotById(id: string): Promise<ITimeSlot | null> {
    return await TimeSlotModel.findByPk(id);
  }

  async updateTimeSlot(id: string, data: Partial<ITimeSlot>): Promise<void> {
    await TimeSlotModel.update(data, { where: { id } });
  }

  async deleteTimeSlot(id: string): Promise<void> {
    await TimeSlotModel.destroy({ where: { id } });
  }

  async getAvailableTimeSlots(doctorId: string): Promise<ITimeSlot[]> {
    return await TimeSlotModel.findAll({ where: { doctorId, isAvailable: true } });
  }
}

export default new TimeSlotDataSource();
```

### 5. Service Layer

Create the service layer for `TimeSlot`.

#### services/timeslot.service.ts

```typescript
import timeSlotDataSource from "../datasources/timeslot.datasource";
import { ITimeSlotCreationBody, ITimeSlot } from "../interfaces/timeslot.interface";

class TimeSlotService {
  async createTimeSlot(data: ITimeSlotCreationBody): Promise<ITimeSlot> {
    return await timeSlotDataSource.createTimeSlot(data);
  }

  async getTimeSlotById(id: string): Promise<ITimeSlot | null> {
    return await timeSlotDataSource.getTimeSlotById(id);
  }

  async updateTimeSlot(id: string, data: Partial<ITimeSlot>): Promise<void> {
    await timeSlotDataSource.updateTimeSlot(id, data);
  }

  async deleteTimeSlot(id: string): Promise<void> {
    await timeSlotDataSource.deleteTimeSlot(id);
  }

  async getAvailableTimeSlots(doctorId: string): Promise<ITimeSlot[]> {
    return await timeSlotDataSource.getAvailableTimeSlots(doctorId);
  }
}

export default new TimeSlotService();
```

### 6. Model Definition

Define the `TimeSlot` model.

#### models/timeslot.model.ts

```typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import DoctorModel from "./doctor.model";
import { ITimeSlotModel } from "../interfaces/timeslot.interface";

const TimeSlotModel = Db.define<ITimeSlotModel>("TimeSlot", {
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: DoctorModel,
      key: "userId",
    },
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: "timeslots",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

DoctorModel.hasMany(TimeSlotModel, {
  foreignKey: "doctorId",
  as: "timeSlots",
});
TimeSlotModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
});

export default TimeSlotModel;
```

### 7. Validator

Create a validator for `TimeSlot`.

#### validators/timeslot.validator.ts

```typescript
import * as yup from "yup";

const timeSlotSchema = yup.object({
  doctorId: yup.string().required(),
  startTime: yup.date().required(),
  endTime: yup.date().required(),
  isAvailable: yup.boolean().default(true),
});

export default timeSlotSchema;
```

### 8. Controller Layer

Implement the controller for `TimeSlot`.

#### controllers/timeslot.controller.ts

```typescript
import { Request, Response } from "express";
import TimeSlotService from "../services/timeslot.service";
import { ITimeSlotCreationBody } from "../interfaces/timeslot.interface";
import timeSlotSchema from "../validators/timeslot.validator";

class TimeSlotController {
  async createTimeSlot(req: Request, res: Response) {
    try {
      const { doctorId, startTime, endTime, isAvailable }: ITimeSlotCreationBody = req.body;
      const newTimeSlot = await TimeSlotService.createTimeSlot({ doctorId, startTime, endTime, isAvailable });
      res.status(201).json({ message: "Time slot created successfully", data: newTimeSlot });
    } catch (error) {
      res.status(500).json({ message: "Error creating time slot", error });
    }
  }

  async getTimeSlot(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const timeSlot = await TimeSlotService.getTimeSlotById(id);
      if (!timeSlot) {
        return res.status(404).json({ message: "Time slot not found" });
      }
      res.status(200).json({ data: timeSlot });
    } catch (error) {
      res.status(500).json({ message: "Error fetching time slot", error });
    }
  }

  async updateTimeSlot(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const updates = req.body;
      await TimeSlotService.updateTimeSlot(id, updates);
      res.status(200).json({ message: "Time slot updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating time slot", error });
    }
  }

  async deleteTimeSlot(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await TimeSlotService.deleteTimeSlot(id);
      res.status(200).json({ message: "Time slot deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting time slot", error });
    }
  }

  async getAvailableTimeSlots(req: Request, res: Response) {
    try {
      const doctorId = req.params.doctorId;
      const timeSlots = await TimeSlotService.getAvailableTimeSlots(doctorId);
      res.status(200).json({ data: timeSlots });
    } catch (error) {
      res.status(500).json({ message: "Error fetching available time slots", error });
    }
  }
}

export default new TimeSlotController();
```

### 9. Router Integration

Integrate the `TimeSlot` routes with the doctor routes.

#### routes/timeslot.router.ts

```typescript
import express from "express";
import TimeSlotController from "../controllers/timeslot.controller";
import { validate } from "../middlewares/validation.middleware";
import timeSlotSchema from "../validators/timeslot.validator";
import { roleBasedAccess } from "../middlewares/role.middleware";

const router = express.Router();

// Routes for managing time slots
router.post("/", roleBasedAccess(["DOCTOR"]), validate(timeSlotSchema), TimeSlotController.createTimeSlot);
router.get("/:id", TimeSlotController.getTimeSlot);
router.put("/:id", roleBasedAccess(["DOCTOR"]), validate(timeSlotSchema), TimeSlotController.updateTimeSlot);
router.delete("/:id", roleBasedAccess(["DOCTOR"]), TimeSlotController.deleteTimeSlot);
router.get("/doctor/:doctorId", TimeSlotController.getAvailableTimeSlots);

export default router;
```

### 10. Doctor Controller Update

Update the Doctor controller to include routes for managing time slots.

#### controllers/doctor.controller.ts

```typescript
import { Request, Response } from "express";
import DoctorService from "../services/doctor.service";
import TimeSlotService from "../services/timeslot.service";
import { IDoctorCreationBody, IDoctor } from "../interfaces/doctor.interfaces";

class DoctorController {
  async createDoctorProfile(req: Request, res: Response) {
    try {
      const { userId, specialization, verificationStatus }: IDoctorCreation

Body = req.body;
      const doctor = await DoctorService.createDoctorProfile(userId, { specialization, verificationStatus });
      res.status(201).json({ message: "Doctor profile created successfully", data: doctor });
    } catch (error) {
      res.status(500).json({ message: "Error creating doctor profile", error });
    }
  }

  async getDoctorProfile(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const doctor = await DoctorService.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.status(200).json({ data: doctor });
    } catch (error) {
      res.status(500).json({ message: "Error fetching doctor profile", error });
    }
  }

  // Add methods to handle time slots here
  async createTimeSlot(req: Request, res: Response) {
    try {
      const doctorId = req.params.doctorId;
      const timeSlotData = req.body;
      const timeSlot = await TimeSlotService.createTimeSlot({ ...timeSlotData, doctorId });
      res.status(201).json({ message: "Time slot created successfully", data: timeSlot });
    } catch (error) {
      res.status(500).json({ message: "Error creating time slot", error });
    }
  }

  async getAvailableTimeSlots(req: Request, res: Response) {
    try {
      const doctorId = req.params.doctorId;
      const timeSlots = await TimeSlotService.getAvailableTimeSlots(doctorId);
      res.status(200).json({ data: timeSlots });
    } catch (error) {
      res.status(500).json({ message: "Error fetching available time slots", error });
    }
  }
}

export default new DoctorController();
```

### 11. Router Update

Update the Doctor router to include routes for handling time slots.

#### routes/doctor.router.ts

```typescript
import express from "express";
import DoctorController from "../controllers/doctor.controller";
import TimeSlotController from "../controllers/timeslot.controller";
import { validate } from "../middlewares/validation.middleware";
import timeSlotSchema from "../validators/timeslot.validator";
import { roleBasedAccess } from "../middlewares/role.middleware";

const router = express.Router();

// Doctor routes
router.post("/", roleBasedAccess(["ADMIN"]), DoctorController.createDoctorProfile);
router.get("/:userId", DoctorController.getDoctorProfile);

// Time slot routes under doctor
router.post("/:doctorId/timeslots", roleBasedAccess(["DOCTOR"]), validate(timeSlotSchema), TimeSlotController.createTimeSlot);
router.get("/:doctorId/timeslots", TimeSlotController.getAvailableTimeSlots);

export default router;
```

### Summary

With these steps, you have fully integrated the `TimeSlot` functionality into your system, ensuring it's managed through the existing doctor controller and router. This setup should be coherent with your layered architecture. Let me know if you need any additional functionality or modifications!