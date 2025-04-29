import express, { Request, Response, NextFunction } from "express";
import MessageController from "../controllers/message.controller";
import { Auth, validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/user.validator.schema";

const router = express.Router();
const messageController = new MessageController();

router.post(
  "/create",
  Auth(),
  validator(validationSchema.createMessageSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await messageController.createMessage(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:userId", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await messageController.getAllMessagesByUserId(req, res);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/conversation/:senderId/:receiverId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await messageController.getConversation(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:messageId/read", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await messageController.markMessageAsRead(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
