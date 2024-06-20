Certainly! Let's create a comprehensive messaging functionality with notifications using `socket.io`. This will involve creating necessary interfaces, enums, models, data sources, services, controllers, and routers. We'll also ensure that relationships between tables are properly handled.

### Step 1: Define Interfaces and Enums

#### interfaces/message.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface IMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageCreationBody extends Optional<IMessage, 'id' | 'createdAt' | 'updatedAt' | 'read'> {}

export interface IMessageModel extends Model<IMessage, IMessageCreationBody>, IMessage {}

export interface IMessageDataSource {
  create(record: IMessageCreationBody): Promise<IMessage>;
  fetchAllByUserId(userId: string): Promise<IMessage[]>;
  fetchConversation(senderId: string, receiverId: string): Promise<IMessage[]>;
  markAsRead(messageId: string): Promise<void>;
}
```

#### interfaces/notification.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface INotification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationCreationBody extends Optional<INotification, 'id' | 'createdAt' | 'updatedAt' | 'read'> {}

export interface INotificationModel extends Model<INotification, INotificationCreationBody>, INotification {}

export interface INotificationDataSource {
  create(record: INotificationCreationBody): Promise<INotification>;
  fetchAllByUserId(userId: string): Promise<INotification[]>;
  markAsRead(notificationId: string): Promise<void>;
}
```

### Step 2: Define Models

#### models/message.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../database";
import { IMessageModel } from "../interfaces/message.interface";
import { v4 as uuidv4 } from "uuid";
import UserModel from "./user.model";

const MessageModel = Db.define<IMessageModel>(
  "MessageModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      allowNull: false,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: "messages",
  }
);

UserModel.hasMany(MessageModel, {
  foreignKey: "senderId",
  as: "sentMessages",
});
MessageModel.belongsTo(UserModel, {
  foreignKey: "senderId",
  as: "sender",
});

UserModel.hasMany(MessageModel, {
  foreignKey: "receiverId",
  as: "receivedMessages",
});
MessageModel.belongsTo(UserModel, {
  foreignKey: "receiverId",
  as: "receiver",
});

export default MessageModel;
```

#### models/notification.model.ts
```typescript
import { DataTypes } from "sequelize";
import Db from "../database";
import { INotificationModel } from "../interfaces/notification.interface";
import { v4 as uuidv4 } from "uuid";
import UserModel from "./user.model";

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
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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

export default NotificationModel;
```

### Step 3: Define Data Sources

#### datasources/message.datasource.ts
```typescript
import { IMessage, IMessageCreationBody, IMessageDataSource } from "../interfaces/message.interface";
import MessageModel from "../models/message.model";
import UserModel from "../models/user.model";

class MessageDataSource implements IMessageDataSource {
  async create(record: IMessageCreationBody): Promise<IMessage> {
    return await MessageModel.create(record);
  }

  async fetchAllByUserId(userId: string): Promise<IMessage[]> {
    return await MessageModel.findAll({
      where: { [Op.or]: [{ senderId: userId }, { receiverId: userId }] },
      include: [
        { model: UserModel, as: "sender" },
        { model: UserModel, as: "receiver" },
      ],
    });
  }

  async fetchConversation(senderId: string, receiverId: string): Promise<IMessage[]> {
    return await MessageModel.findAll({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      include: [
        { model: UserModel, as: "sender" },
        { model: UserModel, as: "receiver" },
      ],
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await MessageModel.update({ read: true }, { where: { id: messageId } });
  }
}

export default MessageDataSource;
```

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

### Step 4: Define Services

#### services/message.service.ts
```typescript
import { IMessage, IMessageCreationBody, IMessageDataSource } from "../interfaces/message.interface";
import { INotificationDataSource } from "../interfaces/notification.interface";
import { Op } from "sequelize";

class MessageService {
  private messageDataSource: IMessageDataSource;
  private notificationDataSource: INotificationDataSource;

  constructor(messageDataSource: IMessageDataSource, notificationDataSource: INotificationDataSource) {
    this.messageDataSource = messageDataSource;
    this.notificationDataSource = notificationDataSource;
  }

  async createMessage(record: IMessageCreationBody): Promise<IMessage> {
    const message = await this.messageDataSource.create(record);
    await this.notificationDataSource.create({
      userId: record.receiverId,
      message: `New message from ${record.senderId}`,
      read: false,
    });
    return message;
  }

  async getAllMessagesByUserId(userId: string): Promise<IMessage[]> {
    return await this.messageDataSource.fetchAllByUserId(userId);
  }

  async getConversation(senderId: string, receiverId: string): Promise<IMessage[]> {
    return await this.messageDataSource.fetchConversation(senderId, receiverId);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.messageDataSource.markAsRead(messageId);
  }
}

export default MessageService;
```

#### services/notification.service.ts
```typescript
import { INotification, INotificationDataSource } from "../interfaces/notification.interface";

class NotificationService {
  private notificationDataSource: INotificationDataSource;

  constructor(notificationDataSource: INotificationDataSource) {
    this.notificationDataSource = notificationDataSource;
  }

  async getAllNotificationsByUserId(userId: string): Promise<INotification[]> {
    return await this.notificationDataSource.fetchAllByUserId(userId);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationDataSource.markAsRead(notificationId);
  }
}

export default NotificationService;
```

### Step 5: Define Controllers

#### controllers/message.controller.ts


```typescript
import { Request, Response } from "express";
import MessageService from "../services/message.service";
import NotificationService from "../services/notification.service";
import MessageDataSource from "../datasources/message.datasource";
import NotificationDataSource from "../datasources/notification.datasource";

class MessageController {
  private messageService: MessageService;
  private notificationService: NotificationService;

  constructor() {
    const messageDataSource = new MessageDataSource();
    const notificationDataSource = new NotificationDataSource();
    this.messageService = new MessageService(messageDataSource, notificationDataSource);
    this.notificationService = new NotificationService(notificationDataSource);
  }

  createMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
      const message = await this.messageService.createMessage(req.body);
      return res.status(201).json(message);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  getAllMessagesByUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const messages = await this.messageService.getAllMessagesByUserId(req.params.userId);
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  getConversation = async (req: Request, res: Response): Promise<Response> => {
    try {
      const messages = await this.messageService.getConversation(req.params.senderId, req.params.receiverId);
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  markMessageAsRead = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.messageService.markMessageAsRead(req.params.messageId);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}

export default MessageController;
```

#### controllers/notification.controller.ts
```typescript
import { Request, Response } from "express";
import NotificationService from "../services/notification.service";
import NotificationDataSource from "../datasources/notification.datasource";

class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    const notificationDataSource = new NotificationDataSource();
    this.notificationService = new NotificationService(notificationDataSource);
  }

  getAllNotificationsByUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const notifications = await this.notificationService.getAllNotificationsByUserId(req.params.userId);
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  markNotificationAsRead = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.notificationService.markNotificationAsRead(req.params.notificationId);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}

export default NotificationController;
```

### Step 6: Define Routes

#### routes/message.routes.ts
```typescript
import express from "express";
import MessageController from "../controllers/message.controller";
import { validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/message.validator.schema";

const router = express.Router();
const messageController = new MessageController();

router.post(
  "/",
  validator(validationSchema.createMessageSchema),
  messageController.createMessage
);

router.get(
  "/:userId",
  messageController.getAllMessagesByUserId
);

router.get(
  "/conversation/:senderId/:receiverId",
  messageController.getConversation
);

router.put(
  "/:messageId/read",
  messageController.markMessageAsRead
);

export default router;
```

#### routes/notification.routes.ts
```typescript
import express from "express";
import NotificationController from "../controllers/notification.controller";

const router = express.Router();
const notificationController = new NotificationController();

router.get(
  "/:userId",
  notificationController.getAllNotificationsByUserId
);

router.put(
  "/:notificationId/read",
  notificationController.markNotificationAsRead
);

export default router;
```

### Step 7: Set Up Socket.io

#### server.ts
```typescript
import express from "express";
import http from "http";
import { Server } from "socket.io";
import messageRoutes from "./routes/message.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

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
      message: `New message from ${message.senderId}`,
      read: false,
    });

    io.to(message.receiverId).emit("newNotification", {
      message: `New message from ${message.senderId}`,
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

### Step 8: Validation Schemas

#### validators/message.validator.schema.ts
```typescript
import * as yup from "yup";

const createMessageSchema = yup.object().shape({
  senderId: yup.string().uuid().required(),
  receiverId: yup.string().uuid().required(),
  content: yup.string().required(),
});

const validationSchema = {
  createMessageSchema,
};

export default validationSchema;
```

Now you have a complete messaging functionality with notifications using `socket.io`. This setup includes interfaces, models, data sources, services, controllers, and routes for messages and notifications. The relationships between the tables are also handled properly.