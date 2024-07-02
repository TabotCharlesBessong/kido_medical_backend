"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const init_1 = __importDefault(require("./database/init"));
const user_router_1 = __importDefault(require("./router/user.router"));
const doctor_router_1 = __importDefault(require("./router/doctor.router"));
const post_router_1 = __importDefault(require("./router/post.router"));
const patient_router_1 = __importDefault(require("./router/patient.router"));
const message_router_1 = __importDefault(require("./router/message.router"));
const socket_io_1 = require("socket.io");
const message_controller_1 = __importDefault(require("./controllers/message.controller"));
//create an app
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const messageController = new message_controller_1.default();
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((err, req, res, next) => {
    try {
        if (err) {
            return res
                .status(500)
                .json({ status: false, message: err.message });
        }
    }
    catch (e) { }
});
app.use("/api/user", user_router_1.default);
app.use("/api/doctor", doctor_router_1.default);
app.use("/api/posts", post_router_1.default);
app.use("/api/patient", patient_router_1.default);
app.use("/api/message", message_router_1.default);
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("sendMessage", (message) => __awaiter(void 0, void 0, void 0, function* () {
        // Handle message creation
        const createdMessage = yield messageController.messageService.createMessage(message);
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
    }));
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});
app.get("/", (req, res) => {
    res.send(`Welcome to ${process.env.APPNAME}`);
});
const PORT = process.env.PORT || 5000;
const Boostrap = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, init_1.default)();
            app.listen(PORT, () => {
                console.log("Connection has been established successfully.");
            });
        }
        catch (error) {
            console.error("Unable to connect to the database:", error);
        }
    });
};
Boostrap();
