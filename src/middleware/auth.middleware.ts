import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ResponseCode } from '../interfaces/enum/code.enum';
import Utility from '../utils/index.utils';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      Utility.handleError(res, 'Authentication token is required', ResponseCode.UNAUTHORIZED);
      return;
    }

    jwt.verify(token, process.env.JWT_KEY as string, (err: any, user: any) => {
      if (err) {
        Utility.handleError(res, 'Invalid or expired token', ResponseCode.UNAUTHORIZED);
        return;
      }

      req.body.user = user;
      next();
    });
  } catch (error) {
    Utility.handleError(res, (error as Error).message, ResponseCode.SERVER_ERROR);
  }
}; 