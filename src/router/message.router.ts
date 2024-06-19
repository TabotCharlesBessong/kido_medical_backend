import express from "express";
import MessageController from "../controllers/message.controller";
import { Auth, validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/user.validator.schema";

const router = express.Router();
const messageController = new MessageController();

router.post(
  "/create",
  Auth(),
  validator(validationSchema.createMessageSchema),
  messageController.createMessage
);

router.get("/:userId", Auth(), messageController.getAllMessagesByUserId);

router.get(
  "/conversation/:senderId/:receiverId",
  messageController.getConversation
);

router.put("/:messageId/read", Auth(), messageController.markMessageAsRead);

export default router;
