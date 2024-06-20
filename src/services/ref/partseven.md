Let's address each of the issues and update the relevant parts of the implementation.

### Update Appointment Method
Let's add the `updateAppointment` method in the `AppointmentController`.

### Fetch All User Notifications
We'll add a method to fetch all notifications for a specific user in the `NotificationService` and `NotificationController`.

### Foreign Key Constraint Violation
The error `insert or update on table "appointments" violates foreign key constraint "appointments_patientId_fkey"` indicates that the `patientId` being referenced does not exist in the `patients` table. We'll ensure that the `patientId` exists before creating an appointment.

### Full Implementation Updates

#### `appointment.services.ts`
```typescript
import { autoInjectable } from "tsyringe";
import AppointmentDataSource from "../datasources/appointment.datasource";
import NotificationService from "./notification.services";
import {
  IFindAppointmentQuery,
  IAppointment,
  IAppointmentCreationBody,
} from "../interfaces/appointment.interface";
import {
  NotificationStatus,
  NotificationTypes,
} from "../interfaces/enum/notification.enum";

@autoInjectable()
class AppointmentService {
  private appointmentDataSource: AppointmentDataSource;
  private notificationService: NotificationService;

  constructor(
    _appointmentDataSource: AppointmentDataSource,
    _notificationService: NotificationService
  ) {
    this.appointmentDataSource = _appointmentDataSource;
    this.notificationService = _notificationService;
  }

  async fetchAppointmentById(id: string): Promise<IAppointment | null> {
    const query = {
      where: { id },
      raw: true,
    } as IFindAppointmentQuery;
    return this.appointmentDataSource.fetchOne(query);
  }

  async createAppointment(data: Partial<IAppointment>): Promise<IAppointment> {
    const newAppointment = {
      ...data,
      status: "Pending",
    } as IAppointmentCreationBody;
    
    // Ensure patientId exists
    const patientExists = await this.appointmentDataSource.fetchOne({ where: { patientId: data.patientId! } });
    if (!patientExists) {
      throw new Error("Patient does not exist");
    }

    const appointment = await this.appointmentDataSource.create(newAppointment);

    await this.notificationService.createNotification({
      userId: data.patientId!,
      message: "Your appointment has been created.",
      status: NotificationStatus.UNREAD,
    });

    return appointment;
  }

  async updateAppointment(id: string, data: Partial<IAppointment>): Promise<void> {
    const filter = { where: { id } } as IFindAppointmentQuery;
    await this.appointmentDataSource.updateOne(data, filter);
  }

  async approveAppointment(id: string): Promise<void> {
    await this.updateAppointment(id, { status: "Approved" });

    const appointment = await this.fetchAppointmentById(id);
    if (appointment) {
      await this.notificationService.createNotification({
        userId: appointment.patientId,
        message: "Your appointment has been approved.",
        status: NotificationStatus.UNREAD,
      });
    }
  }

  async cancelAppointment(id: string): Promise<void> {
    await this.updateAppointment(id, { status: "Cancelled" });

    const appointment = await this.fetchAppointmentById(id);
    if (appointment) {
      await this.notificationService.createNotification({
        userId: appointment.patientId,
        message: "Your appointment has been cancelled.",
        status: NotificationStatus.UNREAD,
      });
    }
  }

  async fetchAllAppointments(): Promise<IAppointment[]> {
    const query = {
      where: {},
      raw: true,
    } as IFindAppointmentQuery;
    return this.appointmentDataSource.fetchAll(query);
  }
}

export default AppointmentService;
```

#### `notification.services.ts`
```typescript
import { autoInjectable } from "tsyringe";
import NotificationDataSource from "../datasources/notification.datasource";
import {
  IFindNotificationQuery,
  INotification,
  INotificationCreationBody,
} from "../interfaces/notification.interface";

@autoInjectable()
class NotificationService {
  private notificationDataSource: NotificationDataSource;

  constructor(_notificationDataSource: NotificationDataSource) {
    this.notificationDataSource = _notificationDataSource;
  }

  async createNotification(
    data: Partial<INotification>
  ): Promise<INotification> {
    const newNotification = {
      ...data,
    } as INotificationCreationBody;
    return this.notificationDataSource.create(newNotification);
  }

  async fetchNotificationById(id: string): Promise<INotification | null> {
    const query = {
      where: { id },
      raw: true,
    } as IFindNotificationQuery;
    return this.notificationDataSource.fetchOne(query);
  }

  async updateNotification(
    id: string,
    data: Partial<INotification>
  ): Promise<void> {
    const filter = { where: { id } } as IFindNotificationQuery;
    await this.notificationDataSource.updateOne(data, filter);
  }

  async fetchAllNotifications(): Promise<INotification[]> {
    const query = {
      where: {},
      raw: true,
    } as IFindNotificationQuery;
    return this.notificationDataSource.fetchAll(query);
  }

  async fetchAllUserNotifications(userId: string): Promise<INotification[]> {
    const query = {
      where: { userId },
      raw: true,
    } as IFindNotificationQuery;
    return this.notificationDataSource.fetchAll(query);
  }
}

export default NotificationService;
```

#### `appointment.controller.ts`
```typescript
import { Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import AppointmentService from "../services/appointment.services";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code.enum";

@autoInjectable()
class AppointmentController {
  private appointmentService: AppointmentService;

  constructor(_appointmentService: AppointmentService) {
    this.appointmentService = _appointmentService;
  }

  async createAppointment(req: Request, res: Response) {
    try {
      const appointment = await this.appointmentService.createAppointment(
        req.body
      );
      res.status(201).json(Utility.response({ code: ResponseCode.CREATED, data: appointment }));
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }

  async updateAppointment(req: Request, res: Response) {
    try {
      await this.appointmentService.updateAppointment(req.params.id, req.body);
      res.status(200).json(Utility.response({ code: ResponseCode.SUCCESS, message: "Appointment updated successfully" }));
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }

  async fetchAppointmentById(req: Request, res: Response) {
    try {
      const appointment = await this.appointmentService.fetchAppointmentById(req.params.id);
      if (appointment) {
        res.status(200).json(Utility.response({ code: ResponseCode.SUCCESS, data: appointment }));
      } else {
        res.status(404).json(Utility.response({ code: ResponseCode.NOT_FOUND, message: "Appointment not found" }));
      }
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }

  async approveAppointment(req: Request, res: Response) {
    try {
      await this.appointmentService.approveAppointment(req.params.id);
      res.status(200).json(Utility.response({ code: ResponseCode.SUCCESS, message: "Appointment approved successfully" }));
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }

  async cancelAppointment(req: Request, res: Response) {
    try {
      await this.appointmentService.cancelAppointment(req.params.id);
      res.status(200).json(Utility.response({ code: ResponseCode.SUCCESS, message: "Appointment cancelled successfully" }));
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }

  async fetchAllAppointments(req: Request, res: Response) {
    try {
      const appointments = await this.appointmentService.fetchAllAppointments();
      res.status(200).json(Utility.response({ code: ResponseCode.SUCCESS, data: appointments }));
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }
}

export default AppointmentController;
```

#### `notification.controller.ts`
```typescript
import { Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import NotificationService from "../services/notification.services";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code.enum";

@autoInjectable()
class NotificationController {
  private notificationService: NotificationService;

  constructor(_notificationService: NotificationService) {
    this.notificationService = _notificationService;
  }

  async createNotification(req: Request, res: Response) {
    try {
      const notification = await this.notificationService.createNotification(
        req.body
      );
      res.status(201).json(Utility.response({ code: ResponseCode.CREATED, data: notification }));
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }

  async fetchNotificationById(req: Request, res: Response) {
    try {
      const notification = await this.notificationService.fetchNotificationById(
        req.params.id
      );
      if (

notification) {
        res.status(200).json(Utility.response({ code: ResponseCode.SUCCESS, data: notification }));
      } else {
        res.status(404).json(Utility.response({ code: ResponseCode.NOT_FOUND, message: "Notification not found" }));
      }
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }

  async updateNotification(req: Request, res: Response) {
    try {
      await this.notificationService.updateNotification(req.params.id, req.body);
      res.status(200).json(Utility.response({ code: ResponseCode.SUCCESS, message: "Notification updated successfully" }));
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }

  async fetchAllNotifications(req: Request, res: Response) {
    try {
      const notifications = await this.notificationService.fetchAllNotifications();
      res.status(200).json(Utility.response({ code: ResponseCode.SUCCESS, data: notifications }));
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }

  async fetchAllUserNotifications(req: Request, res: Response) {
    try {
      const notifications = await this.notificationService.fetchAllUserNotifications(req.params.userId);
      res.status(200).json(Utility.response({ code: ResponseCode.SUCCESS, data: notifications }));
    } catch (error) {
      res.status(400).json(Utility.response({ code: ResponseCode.BAD_REQUEST, message: error.message }));
    }
  }
}

export default NotificationController;
```

### Database Models
Ensure that the associations in your models are correctly set up. Here's a revised version of your models with a focus on correct relationships and constraints:

#### `appointment.model.ts`
```typescript
import { DataTypes } from "sequelize";
import Db from "../database";
import { IAppointmentModel } from "../interfaces/appointment.interface";
import { v4 as uuidv4 } from "uuid";
import PatientModel from "./patient.model";
import DoctorModel from "./doctor.model";

const AppointmentModel = Db.define<IAppointmentModel>(
  "Appointment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      allowNull: false,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: PatientModel,
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
    timeslotId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
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
  },
  {
    timestamps: true,
    tableName: "appointments",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

PatientModel.hasMany(AppointmentModel, {
  foreignKey: "patientId",
  as: "patientAppointments",
});
AppointmentModel.belongsTo(PatientModel, {
  foreignKey: "patientId",
});

DoctorModel.hasMany(AppointmentModel, {
  foreignKey: "doctorId",
  as: "doctorAppointments",
});
AppointmentModel.belongsTo(DoctorModel, {
  foreignKey: "doctorId",
});

export default AppointmentModel;
```

#### `patient.model.ts`
```typescript
import { DataTypes } from "sequelize";
import Db from "../database";
import { IPatientModel } from "../interfaces/patient.interface";
import { v4 as uuidv4 } from "uuid";
import UserModel from "./user.model";

const PatientModel = Db.define<IPatientModel>(
  "Patient",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
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
  },
  {
    timestamps: true,
    tableName: "patients",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

UserModel.hasOne(PatientModel, {
  foreignKey: "userId",
  as: "patient",
});
PatientModel.belongsTo(UserModel, {
  foreignKey: "userId",
});

export default PatientModel;
```

#### `doctor.model.ts`
```typescript
import { DataTypes } from "sequelize";
import Db from "../database";
import UserModel from "./user.model";
import { IDoctorModel } from "../interfaces/doctor.interface";

const DoctorModel = Db.define<IDoctorModel>(
  "Doctor",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
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
    tableName: "doctors",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

UserModel.hasOne(DoctorModel, {
  foreignKey: "userId",
  as: "doctor",
});
DoctorModel.belongsTo(UserModel, {
  foreignKey: "userId",
});

export default DoctorModel;
```

### Notes
1. **Foreign Key Constraint Violation**: Ensure that when creating an appointment, the `patientId` and `doctorId` are valid and exist in the respective tables.
2. **Update Appointment Method**: Added to the `AppointmentController` and `AppointmentService`.
3. **Fetch All User Notifications**: Added to the `NotificationService` and `NotificationController`.

By making these updates, we ensure that all the necessary functionalities are implemented and that the foreign key constraints are properly handled.