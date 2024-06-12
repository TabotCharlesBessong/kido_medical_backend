Sure, let's continue with the implementation.

### Routes (Continued)

#### routes/patient.routes.ts (continued)
```typescript
router.get("/appointments/:patientId", (req, res) => patientController.getAppointments(req, res));

export default router;
```

### Interfaces (Continued)

#### interfaces/appointment.interface.ts
```typescript
import { Model, Optional } from "sequelize";

export interface IAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  timeSlot: string;
  date: string;
  reason: string;
  status: string; // e.g., "PENDING", "APPROVED", "REJECTED"
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointmentCreationBody extends Optional<IAppointment, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IAppointmentModel extends Model<IAppointment, IAppointmentCreationBody>, IAppointment {}

export interface IAppointmentDataSource {
  create(record: IAppointmentCreationBody): Promise<IAppointment>;
  fetchOne(query: IFindUserQuery): Promise<IAppointment | null>;
  updateOne(searchBy: IFindUserQuery, data: Partial<IAppointment>): Promise<void>;
}
```

### Models (Continued)

#### models/appointment.model.ts
typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { IAppointmentModel } from "../interfaces/appointment.interface";
import { v4 as uuidv4 } from "uuid";

const AppointmentModel = Db.define<IAppointmentModel>("Appointment", {
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
      model: "patients",
      key: "userId",
    },
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "doctors",
      key: "userId",
    },
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "PENDING",
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
  tableName: "appointments",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

export default AppointmentModel;


### Middleware for Authentication and Authorization

#### middlewares/auth.middleware.ts
typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await UserModel.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Access denied. User not found." });
    }
    req.user = user;
    next();
  } catch (ex) {
    return res.status(400).json({ error: "Invalid token." });
  }
};

export default authMiddleware;


#### middlewares/role.middleware.ts
typescript
import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model";

const roleMiddleware = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user: UserModel = req.user as UserModel;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Access denied. You do not have the right permissions." });
    }
    next();
  };
};

export default roleMiddleware;


### Main Application Entry Point

#### app.ts
typescript
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes";
import doctorRoutes from "./routes/doctor.routes";
import patientRoutes from "./routes/patient.routes";
import authMiddleware from "./middlewares/auth.middleware";
import roleMiddleware from "./middlewares/role.middleware";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/doctor", authMiddleware, roleMiddleware(["doctor", "admin"]), doctorRoutes);
app.use("/patient", authMiddleware, roleMiddleware(["patient", "admin"]), patientRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


### Implementing the Relationship Between Doctors and Patients

To establish the many-to-many relationship between doctors and patients:

#### models/doctor_patient.model.ts
typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { v4 as uuidv4 } from "uuid";

const DoctorPatientModel = Db.define("DoctorPatient", {
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
      model: "doctors",
      key: "userId",
    },
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "patients",
      key: "userId",
    },
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
  tableName: "doctor_patients",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

export default DoctorPatientModel;


### Implementing the Message Functionality

#### interfaces/message.interface.ts
typescript
import { Model, Optional } from "sequelize";

export interface IMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageCreationBody extends Optional<IMessage, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IMessageModel extends Model<IMessage, IMessageCreationBody>, IMessage {}

export interface IMessageDataSource {
  create(record: IMessageCreationBody): Promise<IMessage>;
  fetchOne(query: IFindUserQuery): Promise<IMessage | null>;
}


#### models/message.model.ts
typescript
import { DataTypes } from "sequelize";
import Db from "../config/database";
import { IMessageModel } from "../interfaces/message.interface";
import { v4 as uuidv4 } from "uuid";

const MessageModel = Db.define<IMessageModel>("Message", {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  content: {
    type: DataTypes.TEXT,
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
  tableName: "messages",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

export default MessageModel;


### Services for Messages

#### services/message.service.ts
```typescript
import { IMessage, IMessageDataSource, IMessageCreationBody } from "../interfaces/message.interface";
import MessageModel from "../models/message.model";

class MessageDataSource implements IMessageDataSource {
  async create(record: IMessageCreationBody): Promise<IMessage> {
    return await MessageModel.create(record);
  }

  async fetchOne(query: IFindUserQuery): Promise<IMessage | null> {
    return await MessageModel.findOne(query);
  }
}

class MessageService {
  private messageDataSource: IMessageDataSource;

  constructor(messageDataSource: IMessageDataSource) {
    this.messageDataSource = messageDataSource;
  }

  async createMessage(record: IMessageCreationBody): Promise<IMessage> {
    return this.messageDataSource.create(record);
  }

  async getMessageById(messageId: string): Promise<IMessage |