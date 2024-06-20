Sure, let's update the appointment data source to include the necessary methods for handling appointments, including creation, approval, and cancellation.

### Appointment Interface
This is a reminder of what the appointment interface looks like for context.

#### interfaces/appointment.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface IAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  timeslotId: string;
  date: Date;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointmentCreationBody extends Optional<IAppointment, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

export interface IAppointmentModel extends Model<IAppointment, IAppointmentCreationBody>, IAppointment {}

export interface IAppointmentDataSource {
  create(record: IAppointmentCreationBody): Promise<IAppointment>;
  fetchById(appointmentId: string): Promise<IAppointment | null>;
  update(searchBy: Partial<IAppointment>, updateBody: Partial<IAppointment>): Promise<void>;
}
```

### Appointment Data Source

#### datasources/appointment.datasource.ts
```typescript
import { IAppointment, IAppointmentCreationBody, IAppointmentDataSource } from "../interfaces/appointment.interface";
import AppointmentModel from "../models/appointment.model";

class AppointmentDataSource implements IAppointmentDataSource {
  async create(record: IAppointmentCreationBody): Promise<IAppointment> {
    const appointment = await AppointmentModel.create(record);
    return appointment;
  }

  async fetchById(appointmentId: string): Promise<IAppointment | null> {
    return await AppointmentModel.findOne({
      where: { id: appointmentId },
    });
  }

  async update(searchBy: Partial<IAppointment>, updateBody: Partial<IAppointment>): Promise<void> {
    await AppointmentModel.update(updateBody, { where: searchBy });
  }
}

export default AppointmentDataSource;
```

### Appointment Service

Update the appointment service to use the data source.

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
    if (appointment) {
      await this.notificationDataSource.create({
        userId: appointment.patientId,
        appointmentId: appointment.id,
        message: `Your appointment with Dr. ${doctorId} has been approved.`,
        type: NotificationType.APPOINTMENT_APPROVED,
        read: false,
      });
    }
  }

  async cancelAppointment(appointmentId: string, doctorId: string): Promise<void> {
    await this.appointmentDataSource.update({ id: appointmentId }, { status: 'CANCELLED' });

    // Notify the patient
    const appointment = await this.appointmentDataSource.fetchById(appointmentId);
    if (appointment) {
      await this.notificationDataSource.create({
        userId: appointment.patientId,
        appointmentId: appointment.id,
        message: `Your appointment with Dr. ${doctorId} has been cancelled.`,
        type: NotificationType.APPOINTMENT_CANCELLED,
        read: false,
      });
    }
  }
}

export default AppointmentService;
```

### Updating Notification Service

If not already done, let's ensure the notification service can handle the different types of notifications.

#### services/notification.service.ts
```typescript
import { INotification, INotificationCreationBody, INotificationDataSource } from "../interfaces/notification.interface";

class NotificationService {
  private notificationDataSource: INotificationDataSource;

  constructor(notificationDataSource: INotificationDataSource) {
    this.notificationDataSource = notificationDataSource;
  }

  async create(notification: INotificationCreationBody): Promise<INotification> {
    return await this.notificationDataSource.create(notification);
  }

  async fetchAllByUserId(userId: string): Promise<INotification[]> {
    return await this.notificationDataSource.fetchAllByUserId(userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationDataSource.markAsRead(notificationId);
  }
}

export default NotificationService;
```

### Updating Notification Controller

#### controllers/notification.controller.ts
```typescript
import { Request, Response } from "express";
import NotificationService from "../services/notification.service";

class NotificationController {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  async getAllNotifications(req: Request, res: Response): Promise<Response> {
    const { userId } = req.params;
    try {
      const notifications = await this.notificationService.fetchAllByUserId(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<Response> {
    const { notificationId } = req.params;
    try {
      await this.notificationService.markAsRead(notificationId);
      return res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default NotificationController;
```

### Updating Notification Router

#### routes/notification.routes.ts
```typescript
import express from "express";
import NotificationController from "../controllers/notification.controller";
import NotificationService from "../services/notification.service";
import NotificationDataSource from "../datasources/notification.datasource";

const router = express.Router();

const notificationDataSource = new NotificationDataSource();
const notificationService = new NotificationService(notificationDataSource);
const notificationController = new NotificationController(notificationService);

router.get(
  "/:userId",
  (req, res) => notificationController.getAllNotifications(req, res)
);

router.put(
  "/:notificationId/read",
  (req, res) => notificationController.markAsRead(req, res)
);

export default router;
```

### Updated Associations

Ensure all associations are correctly set up in the models to reflect the new relationships:

#### models/notification.model.ts (Updated)
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

### Updating Socket.io Integration

Make sure the server file is set up to handle real-time notifications:

#### server.ts (Updated)
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
    const createdMessage = await messageService.createMessage(message);
    io.to(message.receiverId).emit("receiveMessage", createdMessage);

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

  socket.on("appointmentScheduled", async (appointment) => {
    const createdAppointment = await appointmentService.createAppointment(appointment);
    io.to(appointment.doctorId).emit("newAppointment", createdAppointment);

    await notificationService.create({
      userId: appointment.doctorId,
      appointmentId: createdAppointment.id,
      message: `New appointment scheduled by ${appointment.patientId}`,
      type: NotificationType.APPOINTMENT_SCHEDULED,
      read: false,
    });

    io.to(appointment.doctorId).emit("newNotification", {
      appointmentId: createdAppointment.id,
      message: `New appointment scheduled by ${appointment.patientId}`,
      type: NotificationType.APPOINTMENT_SCHEDULED,
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

With these updates, notifications are now sent for messages and various appointment-related events, such as scheduling, approval, and cancellation. This ensures that both patients and doctors are properly notified of relevant activities.