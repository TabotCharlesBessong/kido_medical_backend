import bcrypt from "bcrypt";
import { Request, Response } from "express";
import JWT from "jsonwebtoken";
import moment from "moment";
import { ResponseCode } from "../interfaces/enum/code.enum";
import {
  AccountStatus,
  EmailStatus,
  UserRoles,
} from "../interfaces/enum/user.enum";
import { IToken } from "../interfaces/token.interface";
import { IUserCreationBody } from "../interfaces/user.interfaces";
import EmailService from "../services/email.service";
import TokenService from "../services/token.service";
import UserService from "../services/user.services";
import Utility from "../utils/index.utils";

class UserController {
  private userService: UserService;
  private tokenService: TokenService;

  constructor() {
    this.userService = new UserService();
    this.tokenService = new TokenService();
  }

  async register(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newUser = {
        firstname: params.firstname,
        lastname: params.lastname,
        email: params.email,
        username: params.email.split("@")[0],
        password: params.password,
        role: UserRoles.PATIENT,
        isEmailVerified: EmailStatus.NOT_VERIFIED,
        accountStatus: AccountStatus.ACTIVE,
      } as IUserCreationBody;
      newUser.password = bcrypt.hashSync(newUser.password, 10);
      let userExists = await this.userService.getUserByField({
        email: newUser.email,
      });
      if (userExists)
        return Utility.handleError(
          res,
          "User with email address already exists",
          ResponseCode.ALREADY_EXIST
        );

      let user = await this.userService.createUser(newUser);
      const token = (await this.tokenService.createVerificationToken(
        newUser.email
      )) as IToken;
      await EmailService.sendVerificationMail(newUser.email, token.code);
      return Utility.handleSuccess(
        res,
        "User registered successfully. Please check your email for verification code.",
        { user },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      res.send({ message: "Server error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      let user = await this.userService.getUserByField({ email: params.email });
      if (!user) {
        return Utility.handleError(
          res,
          "Invalid Login Detail",
          ResponseCode.NOT_FOUND
        );
      }
      const passwordMatch = await bcrypt.compare(
        params.password,
        user.password
      );
      if (!passwordMatch) {
        return Utility.handleError(
          res,
          "Invalid login detail",
          ResponseCode.NOT_FOUND
        );
      }
      const token = JWT.sign(
        {
          firstname: user.firstname,
          lastname: user.lastname,
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_KEY as string,
        { expiresIn: "30d" }
      );
      return Utility.handleSuccess(
        res,
        "Login successful",
        { user, token },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      let user = await this.userService.getUserByField({ email: params.email });
      if (!user) {
        return Utility.handleError(
          res,
          "Account does not exist!",
          ResponseCode.NOT_FOUND
        );
      }
      const token = (await this.tokenService.createForgotPasswordToken(
        params.email
      )) as IToken;
      await EmailService.sendForgotPasswordMail(params.email, token.code);
      return Utility.handleSuccess(
        res,
        "Password reset code sent to your email",
        { token },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      let isValidToken = await this.tokenService.getTokenByField({
        key: params.email,
        code: params.code,
        type: this.tokenService.TokenTypes.FORGOT_PASSWORD,
        status: this.tokenService.TokenStatus.NOTUSED,
      });

      if (!isValidToken) {
        return Utility.handleError(
          res,
          "Token has expired",
          ResponseCode.NOT_FOUND
        );
      }

      if (
        isValidToken &&
        moment(isValidToken.expires).diff(moment(), "minute") <= 0
      ) {
        return Utility.handleError(
          res,
          "Token has expired",
          ResponseCode.NOT_FOUND
        );
      }

      let user = await this.userService.getUserByField({ email: params.email });
      if (!user) {
        return Utility.handleError(
          res,
          "Invalid user records",
          ResponseCode.NOT_FOUND
        );
      }

      const _password = bcrypt.hashSync(params.password, 10);

      await this.userService.updateRecord(
        { id: user.id },
        { password: _password }
      );

      await this.tokenService.updateRecord(
        { id: isValidToken.id },
        { status: this.tokenService.TokenStatus.USED }
      );
      return Utility.handleSuccess(
        res,
        "Password reset successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async verifyAccount(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      let isValidToken = await this.tokenService.getTokenByField({
        key: params.email,
        code: params.code,
        type: this.tokenService.TokenTypes.VERIFY_ACCOUNT,
        status: this.tokenService.TokenStatus.NOTUSED,
      });

      if (!isValidToken) {
        return Utility.handleError(
          res,
          "Token has expired or is invalid",
          ResponseCode.NOT_FOUND
        );
      }

      if (
        isValidToken &&
        moment(isValidToken.expires).diff(moment(), "minute") <= 0
      ) {
        return Utility.handleError(
          res,
          "Token has expired",
          ResponseCode.NOT_FOUND
        );
      }

      let user = await this.userService.getUserByField({ email: params.email });
      if (!user) {
        return Utility.handleError(
          res,
          "Invalid user records",
          ResponseCode.NOT_FOUND
        );
      }

      await this.userService.updateRecord(
        { id: user.id },
        { isEmailVerified: EmailStatus.VERIFIED }
      );

      await this.tokenService.updateRecord(
        { id: isValidToken.id },
        { status: this.tokenService.TokenStatus.USED }
      );
      return Utility.handleSuccess(
        res,
        "Account verified successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = req.body.userId;
      await this.userService.logout(userId);
      return Utility.handleSuccess(
        res,
        "Logout successful",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      let users = await this.userService.getUsers()
      return Utility.handleSuccess(
        res,
        "Account fetched successfully",
        { users },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }
}

export default UserController;
