import { Request, Response, NextFunction } from 'express';
import { ResponseCode } from '../interfaces/enum/code.enum';
import { UserRoles } from '../interfaces/enum/user.enum';
import Utility from '../utils/index.utils';

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = req.body.user;
    
    if (!user) {
      Utility.handleError(res, 'User not authenticated', ResponseCode.UNAUTHORIZED);
      return;
    }

    if (user.role !== UserRoles.ADMIN) {
      Utility.handleError(res, 'Access denied. Admin privileges required', ResponseCode.FORBIDDEN);
      return;
    }

    next();
  } catch (error) {
    Utility.handleError(res, (error as Error).message, ResponseCode.SERVER_ERROR);
  }
}; 