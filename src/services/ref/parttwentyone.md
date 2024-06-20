To accommodate the additional scenarios where notifications are sent (e.g., when a doctor approves or cancels an appointment, or when a patient schedules an appointment with a doctor), we need to update several parts of the implementation. 

### Step 1: Update Notification Interface

#### interfaces/notification.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export enum NotificationType {
  MESSAGE = "MESSAGE",
  APPOINTMENT_SCHEDULED = "APPOINTMENT_SCHEDULED",
  APPOINTMENT_APPROVED = "APPOINTMENT_APPROVED",
  APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED",
}

export interface INotification {
  id: string;
  userId: string;
  messageId?: string;
  appointmentId?: string;
  message: string;
  read: boolean;
  type: NotificationType;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationCreationBody extends Optional<INotification, 'id' | 'createdAt' | 'updatedAt' | 'read' | 'messageId' | 'appointmentId'> {}

export interface INotificationModel extends Model<INotification, INotificationCreationBody>, INotification {}

export interface INotificationDataSource {
  create(record: INotificationCreationBody): Promise<INotification>;
  fetchAllByUserId(userId: string): Promise<INotification[]>;
  markAsRead(notificationId: string): Promise<void>;
}
```

### Step 2: Update Notification Model

#### models/notification.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../database";
import { INotificationModel } from "../interfaces/notification.interface";
import { v4 as uuidv4 } from "uuid";
import UserModel from "./user.model";
import MessageModel from "./message.model";
import AppointmentModel from "./appointment.model";

const NotificationModel = Db.define<INotificationModel>(
  "NotificationModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      allowNull: false,
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
    messageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: MessageModel,
        key: "id",
      },
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: AppointmentModel,
        key: "id",
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM("MESSAGE", "APPOINTMENT_SCHEDULED", "APPOINTMENT_APPROVED", "APPOINTMENT_CANCELLED"),
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
    tableName: "notifications",
  }
);

UserModel.hasMany(NotificationModel, {
  foreignKey: "userId",
  as: "notifications",
});
NotificationModel.belongsTo(UserModel, {
  foreignKey: "userId",
});

MessageModel.hasMany(NotificationModel, {
  foreignKey: "messageId",
  as: "messageNotifications",
});
NotificationModel.belongsTo(MessageModel, {
  foreignKey: "messageId",
});

AppointmentModel.hasMany(NotificationModel, {
  foreignKey: "appointmentId",
  as: "appointmentNotifications",
});
NotificationModel.belongsTo(AppointmentModel, {
  foreignKey: "appointmentId",
});

export default NotificationModel;
```

### Step 3: Update Notification Data Source

#### datasources/notification.datasource.ts
```typescript
import { INotification, INotificationCreationBody, INotificationDataSource } from "../interfaces/notification.interface";
import NotificationModel from "../models/notification.model";

class NotificationDataSource implements INotificationDataSource {
  async create(record: INotificationCreationBody): Promise<INotification> {
    return await NotificationModel.create(record);
  }

  async fetchAllByUserId(userId: string): Promise<INotification[]> {
    return await NotificationModel.findAll({
      where: { userId },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await NotificationModel.update({ read: true }, { where: { id: notificationId } });
  }
}

export default NotificationDataSource;
```

### Step 4: Update Appointment Service

#### services/appointment.service.ts
```typescript
import { IAppointment, IAppointmentCreationBody, IAppointmentDataSource } from "../interfaces/appointment.interface";
import { INotificationDataSource, NotificationType } from "../interfaces/notification.interface";

class AppointmentService {
  private appointmentDataSource: IAppointmentDataSource;
  private notificationDataSource: INotificationDataSource;

  constructor(appointmentDataSource: IAppointmentDataSource, notificationDataSource: INotificationDataSource) {
    this.appointmentDataSource = appointmentDataSource;
    this.notificationDataSource = notificationDataSource;
  }

  async createAppointment(record: IAppointmentCreationBody): Promise<IAppointment> {
    const appointment = await this.appointmentDataSource.create(record);

    // Notify the doctor
    await this.notificationDataSource.create({
      userId: record.doctorId,
      appointmentId: appointment.id,
      message: `New appointment scheduled by ${record.patientId}`,
      type: NotificationType.APPOINTMENT_SCHEDULED,
      read: false,
    });

    return appointment;
  }

  async approveAppointment(appointmentId: string, doctorId: string): Promise<void> {
    await this.appointmentDataSource.update({ id: appointmentId }, { status: 'APPROVED' });

    // Notify the patient
    const appointment = await this.appointmentDataSource.fetchById(appointmentId);
    await this.notificationDataSource.create({
      userId: appointment.patientId,
      appointmentId: appointment.id,
      message: `Your appointment with Dr. ${doctorId} has been approved.`,
      type: NotificationType.APPOINTMENT_APPROVED,
      read: false,
    });
  }

  async cancelAppointment(appointmentId: string, doctorId: string): Promise<void> {
    await this.appointmentDataSource.update({ id: appointmentId }, { status: 'CANCELLED' });

    // Notify the patient
    const appointment = await this.appointmentDataSource.fetchById(appointmentId);
    await this.notificationDataSource.create({
      userId: appointment.patientId,
      appointmentId: appointment.id,
      message: `Your appointment with Dr. ${doctorId} has been cancelled.`,
      type: NotificationType.APPOINTMENT_CANCELLED,
      read: false,
    });
  }
}

export default AppointmentService;
```

### Step 5: Update Appointment Controller

#### controllers/appointment.controller.ts
```typescript
import { Request, Response } from "express";
import AppointmentService from "../services/appointment.service";
import { IAppointmentCreationBody } from "../interfaces/appointment.interface";

class AppointmentController {
  private appointmentService: AppointmentService;

  constructor(appointmentService: AppointmentService) {
    this.appointmentService = appointmentService;
  }

  async createAppointment(req: Request, res: Response): Promise<Response> {
    const appointmentData: IAppointmentCreationBody = req.body;
    try {
      const appointment = await this.appointmentService.createAppointment(appointmentData);
      return res.status(201).json(appointment);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async approveAppointment(req: Request, res: Response): Promise<Response> {
    const { appointmentId } = req.params;
    const { doctorId } = req.body;
    try {
      await this.appointmentService.approveAppointment(appointmentId, doctorId);
      return res.status(200).json({ message: "Appointment approved" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async cancelAppointment(req: Request, res: Response): Promise<Response> {
    const { appointmentId } = req.params;
    const { doctorId } = req.body;
    try {
      await this.appointmentService.cancelAppointment(appointmentId, doctorId);
      return res.status(200).json({ message: "Appointment cancelled" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default AppointmentController;
```

### Step 6: Update Appointment Router

#### routes/appointment.routes.ts
```typescript
import express from "express";
import AppointmentController from "../controllers/appointment.controller";
import AppointmentService from "../services/appointment.service";
import AppointmentDataSource from "../datasources/appointment.datasource";
import NotificationDataSource from "../datasources/notification.datasource";
import { validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/appointment.validator.schema";

const router = express.Router();

const appointmentDataSource = new AppointmentDataSource();
const notificationDataSource = new NotificationDataSource();
const appointmentService = new AppointmentService(appointmentDataSource, notificationDataSource);
const appointmentController = new AppointmentController(appointmentService);

router.post(
  "/",
  validator(validationSchema.createAppointmentSchema),
  (req, res) => appointmentController.createAppointment(req, res)
);

router.put(
  "/

approve/:appointmentId",
  validator(validationSchema.approveOrCancelAppointmentSchema),
  (req, res) => appointmentController.approveAppointment(req, res)
);

router.put(
  "/cancel/:appointmentId",
  validator(validationSchema.approveOrCancelAppointmentSchema),
  (req, res) => appointmentController.cancelAppointment(req, res)
);

export default router;
```

### Step 7: Update Socket.io Integration

#### server.ts
```typescript
import express from "express";
import http from "http";
import { Server } from "socket.io";
import messageRoutes from "./routes/message.routes";
import notificationRoutes from "./routes/notification.routes";
import appointmentRoutes from "./routes/appointment.routes";
import MessageService from "./services/message.service";
import NotificationService from "./services/notification.service";
import AppointmentService from "./services/appointment.service";
import MessageDataSource from "./datasources/message.datasource";
import NotificationDataSource from "./datasources/notification.datasource";
import AppointmentDataSource from "./datasources/appointment.datasource";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/appointments", appointmentRoutes);

const messageDataSource = new MessageDataSource();
const notificationDataSource = new NotificationDataSource();
const appointmentDataSource = new AppointmentDataSource();

const messageService = new MessageService(messageDataSource, notificationDataSource);
const notificationService = new NotificationService(notificationDataSource);
const appointmentService = new AppointmentService(appointmentDataSource, notificationDataSource);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", async (message) => {
    // Handle message creation
    const createdMessage = await messageService.createMessage(message);

    // Emit the message to the receiver
    io.to(message.receiverId).emit("receiveMessage", createdMessage);

    // Notify the receiver
    await notificationService.create({
      userId: message.receiverId,
      messageId: createdMessage.id,
      message: `New message from ${message.senderId}`,
      type: NotificationType.MESSAGE,
      read: false,
    });

    io.to(message.receiverId).emit("newNotification", {
      messageId: createdMessage.id,
      message: `New message from ${message.senderId}`,
      type: NotificationType.MESSAGE,
      read: false,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

This updated implementation ensures that notifications can be sent not only for messages but also for appointment-related events such as scheduling, approval, and cancellation. The necessary updates to the data models, services, controllers, and routes have been made to support this extended functionality.