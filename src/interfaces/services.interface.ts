import { IUser } from './user.interfaces';
import { IFindUserQuery } from './user.interfaces';
import { IUserCreationBody } from './user.interfaces';

export interface IUserService {
  getUserByField(record: Partial<IUser>): Promise<IUser | null>;
  createUser(record: IUserCreationBody): Promise<IUser>;
  updateRecord(searchBy: Partial<IUser>, record: Partial<IUser>): Promise<void>;
  updateUserRole(userId: string, role: string): Promise<void>;
  logout(userId: string): Promise<void>;
  getUsers(): Promise<IUser[]>;
}

export interface IUploadService {
  getUploadMiddleware(): any;
  uploadFile(file: Express.Multer.File): Promise<string>;
  deleteFile(publicId: string): Promise<void>;
} 