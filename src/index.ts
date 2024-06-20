import http from 'http';
import express, { Request, Response, Express, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import DbInitialize from "./database/init";
import userRouter from "./router/user.router";
import doctorRouter from "./router/doctor.router";
import postRouter from "./router/post.router";
import patientRouter from "./router/patient.router";
import messageRouter from "./router/message.router";
import {Server} from "socket.io"
import MessageController from './controllers/message.controller';

//create an app
const app = express();
const server = http.createServer(app)
const io = new Server(server)
const messageController = new MessageController();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((err: TypeError, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err) {
      return res
        .status(500)
        .json({ status: false, message: (err as TypeError).message });
    }
  } catch (e) {}
});

app.use("/api/user", userRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/posts", postRouter);
app.use("/api/patient", patientRouter);
app.use("/api/message", messageRouter);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", async (message) => {
    // Handle message creation
    const createdMessage = await messageController.messageService.createMessage(message);

    // Emit the message to the receiver
    io.to(message.receiverId).emit("receiveMessage", createdMessage);

    // Notify the receiver
    // await notificationService.create({
    //   userId: message.receiverId,
    //   message: `New message from ${message.senderId}`,
    //   read: false,
    // });

    io.to(message.receiverId).emit("newNotification", {
      message: `New message from ${message.senderId}`,
      read: false,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to ${process.env.APPNAME}`);
});

const PORT = process.env.PORT || 5000;

const Boostrap = async function () {
  try {
    await DbInitialize();
    app.listen(PORT, () => {
      console.log("Connection has been established successfully.");
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

Boostrap();
