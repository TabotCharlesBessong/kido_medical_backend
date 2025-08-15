import { Request, Response } from "express";
import { ResponseCode } from "../interfaces/enum/code.enum";
import Utility from "../utils/index.utils";
import UserService from "../services/user.services";
import UserDataSource from "../datasources/user.datasource";
import TokenDataSource from "../datasources/token.datasource";
import EmailService from "../services/email.service";

const userDataSource = new UserDataSource();
const tokenDataSource = new TokenDataSource();
const userService = new UserService(userDataSource, tokenDataSource);

class AuthController {
  /**
   * Request account verification for expired tokens
   */
  async requestAccountVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          status: false,
          message: "Email is required",
        });
        return;
      }

      // Check if user exists
      const user = await userService.getUserByField({ email });
      if (!user) {
        res.status(404).json({
          status: false,
          message: "User not found",
        });
        return;
      }

      // Check if user account is active
      if (user.accountStatus === "DELETED") {
        res.status(400).json({
          status: false,
          message: "Account has been deleted",
        });
        return;
      }

      // Generate new verification token
      const verificationToken = await userService.generateVerificationToken(user.id);
      
      // Send verification email
      await EmailService.sendVerificationEmail(user.email, verificationToken);

      res.status(200).json({
        status: true,
        message: "Verification email sent successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  /**
   * Verify account with token
   */
  async verifyAccount(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({
          status: false,
          message: "Verification token is required",
        });
        return;
      }

      // Verify the token
      const verificationResult = await userService.verifyAccount(token);
      
      if (!verificationResult.success) {
        res.status(400).json({
          status: false,
          message: verificationResult.message,
        });
        return;
      }

      res.status(200).json({
        status: true,
        message: "Account verified successfully",
        data: {
          user: verificationResult.user,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}

export default new AuthController(); 