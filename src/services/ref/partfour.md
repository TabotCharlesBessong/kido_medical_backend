### Services for Messages (Continued)

#### services/message.service.ts (continued)
typescript
  async getMessageById(messageId: string): Promise<IMessage | null> {
    const query = { where: { id: messageId }, raw: true, returning: true };
    return this.messageDataSource.fetchOne(query);
  }
}

export { MessageDataSource, MessageService };


### Controllers for Messages

#### controllers/message.controller.ts
typescript
import { Request, Response } from "express";
import { MessageService } from "../services/message.service";

class MessageController {
  private messageService: MessageService;

  constructor(messageService: MessageService) {
    this.messageService = messageService;
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const { senderId, receiverId, content } = req.body;
      const messageRecord = { senderId, receiverId, content };
      const message = await this.messageService.createMessage(messageRecord);
      return res.status(201).json({ message });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const message = await this.messageService.getMessageById(messageId);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      return res.status(200).json({ message });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }
}

export default MessageController;


### Routes for Messages

#### routes/message.routes.ts
typescript
import express from "express";
import MessageController from "../controllers/message.controller";
import { MessageDataSource } from "../services/message.service";

const router = express.Router();

const messageService = new MessageService(new MessageDataSource());
const messageController = new MessageController(messageService);

router.post("/send", (req, res) => messageController.sendMessage(req, res));
router.get("/:messageId", (req, res) => messageController.getMessage(req, res));

export default router;


### Main Application Entry Point (Updated)

#### app.ts (updated)
typescript
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes";
import doctorRoutes from "./routes/doctor.routes";
import patientRoutes from "./routes/patient.routes";
import messageRoutes from "./routes/message.routes";
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
app.use("/message", authMiddleware, messageRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


### Summary

The provided code outlines a comprehensive system for managing users (patients and doctors), appointments, messages, and user authentication and authorization. Here's a brief summary:

- *User Management*: UserController, UserService, and UserDataSource handle user creation and retrieval.
- *Doctor Management*: DoctorController, DoctorService, and DoctorDataSource manage doctor-specific operations like registering a doctor and managing available time slots.
- *Patient Management*: PatientController, PatientService, and PatientDataSource manage patient-specific operations like registering a patient and booking appointments.
- *Appointments*: AppointmentController, AppointmentService, and AppointmentDataSource manage creating, updating, and retrieving appointments.
- *Messages*: MessageController, MessageService, and MessageDataSource handle sending and retrieving messages between users.
- *Authentication and Authorization*: Middleware ensures secure access to routes based on roles.

### Next Steps

To complete the project, the following steps are recommended:

1. *Test the Application*: Write unit tests for each service and controller to ensure the application works as expected.
2. *Enhance Error Handling*: Implement more detailed error handling and logging for better debugging and maintenance.
3. *Optimize Database Queries*: Review and optimize database queries for better performance.
4. *Deploy the Application*: Prepare the application for deployment, ensuring environment configurations and security settings are properly managed.
5. *Documentation*: Document the API endpoints and functionality for future reference and development.

This setup provides a solid foundation for a medical appointment booking system, with scalable and maintainable code architecture.