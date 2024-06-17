Let's extend your backend to include OTP verification, password reset functionality, and image upload using Cloudinary. Here's how to integrate these features:

### Step 1: Set Up Cloudinary
First, set up Cloudinary by signing up for an account at [Cloudinary](https://cloudinary.com/). Then, get your API credentials.

### Step 2: Install Required Packages
Install the necessary packages:
bash
npm install cloudinary nodemailer crypto


### Step 3: Configure Cloudinary and Nodemailer
Create a new file config/cloudinary.ts:
typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;


Create a new file config/nodemailer.ts:
typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default transporter;


### Step 4: Update User Model for OTP
Add otp and otpExpires fields to the user model:
typescript
import { DataTypes } from 'sequelize';
import Db from '../database';
import { IUserModel } from '../interfaces/user.interfaces';
import { v4 as uuidv4 } from 'uuid';

const UserModel = Db.define<IUserModel>('UserModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isEmailVerified: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'users',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default UserModel;


### Step 5: Create Utility Functions for OTP and Email

#### utils/otp.utils.ts
typescript
import crypto from 'crypto';

export const generateOTP = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

export const generateOTPExpiry = (): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10); // OTP valid for 10 minutes
  return expiry;
};


#### utils/email.utils.ts
typescript
import transporter from '../config/nodemailer';

export const sendOTP = (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  return transporter.sendMail(mailOptions);
};


### Step 6: Add OTP Verification and Password Reset in Services and Controllers

#### services/auth.service.ts
typescript
import { IUser, IUserDataSource } from '../interfaces/user.interfaces';
import { generateOTP, generateOTPExpiry } from '../utils/otp.utils';
import { sendOTP } from '../utils/email.utils';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

class AuthService {
  private userDataSource: IUserDataSource;

  constructor(userDataSource: IUserDataSource) {
    this.userDataSource = userDataSource;
  }

  async registerUser(user: IUser): Promise<IUser> {
    const otp = generateOTP();
    const otpExpires = generateOTPExpiry();
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.password = bcrypt.hashSync(user.password, 10);
    
    const createdUser = await this.userDataSource.create(user);
    await sendOTP(user.email, otp);
    
    return createdUser;
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const user = await this.userDataSource.fetchOne({ where: { email } });
    
    if (user && user.otp === otp && new Date() < user.otpExpires) {
      await this.userDataSource.updateOne({ where: { email } }, {
        isEmailVerified: 'VERIFIED',
        otp: null,
        otpExpires: null,
      });
      return true;
    }
    return false;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userDataSource.fetchOne({ where: { email } });
    if (!user) throw new Error('User not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token valid for 1 hour

    await this.userDataSource.updateOne({ where: { email } }, {
      passwordResetToken: hashedResetToken,
      passwordResetExpires: resetTokenExpires,
    });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      text: `Reset your password using the following link: ${resetURL}`,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userDataSource.fetchOne({ where: { passwordResetToken: hashedResetToken } });
    
    if (!user || new Date() > user.passwordResetExpires) throw new Error('Token is invalid or has expired');

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await this.userDataSource.updateOne({ where: { id: user.id } }, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }
}

export default AuthService;


#### controllers/auth.controller.ts
typescript
import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import UserDataSource from '../services/user.datasource';
import { IUser } from '../interfaces/user.interfaces';

const userDataSource = new UserDataSource();
const authService = new AuthService(userDataSource);

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const user = req.body as IUser;
      const newUser = await authService.registerUser(user);
      res.status(201).json({ user: newUser });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const isVerified = await authService.verifyOTP(email, otp);
      if (isVerified) {
        res.status(200).json({ message: 'OTP verified successfully' });
      } else {
        res.status(400).json({ error: 'Invalid OTP or OTP has expired' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);
      res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}

export default AuthController;


#### routes/auth.routes.ts
```typescript
import express from 'express';
import AuthController from '../controllers/auth.controller';

const router = express.Router();
const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/verify-otp', (req, res) => authController.verifyOTP(req, res));
router.post('/request-password
```