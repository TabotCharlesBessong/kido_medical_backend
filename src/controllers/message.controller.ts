import { Request, Response } from "express";
import MessageDataSource from "../datasources/message.datasource";
import { ResponseCode } from "../interfaces/enum/code.enum";
import MessageService from "../services/message.service";
import Utility from "../utils/index.utils";

class MessageController {
  private messageService: MessageService;

  constructor() {
    const messageDataSource = new MessageDataSource();
    this.messageService = new MessageService(
      messageDataSource,
    );
  }

  createMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
      const params = {...req.body}
      const newMessage = {
        senderId:params.user.id,
        receiverId:params.receiverId,
        content:params.content
      }
      const message = await this.messageService.createMessage(newMessage);
      return Utility.handleSuccess(
        res,
        "Post updated successfully",
        { message },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  };

  getAllMessagesByUserId = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const messages = await this.messageService.getAllMessagesByUserId(
        req.params.userId
      );
      return Utility.handleSuccess(
        res,
        "Post updated successfully",
        { messages },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  };

  getConversation = async (req: Request, res: Response): Promise<Response> => {
    try {
      const messages = await this.messageService.getConversation(
        req.params.senderId,
        req.params.receiverId
      );
      return Utility.handleSuccess(
        res,
        "Post updated successfully",
        { messages },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  };

  markMessageAsRead = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      await this.messageService.markMessageAsRead(req.params.messageId);
      return res.status(204).send();
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  };
}

export default MessageController;
