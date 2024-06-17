To implement role-based access control (RBAC) in your backend, we need to add middleware that checks the user's role before allowing access to certain routes. Let's integrate this into your existing setup.

### Step 1: Add Role Field to User Model

Ensure the role field is included in the User model. We assume you already have this based on the previous discussions.

### Step 2: Create Role-Based Access Middleware

Create a middleware function to check the user's role.

#### middlewares/auth.middleware.ts
typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserService from '../services/user.service';
import { IUser } from '../interfaces/user.interface';

const userService = new UserService();

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

export { authenticateToken, authorizeRoles };


### Step 3: Update User Routes to Use Middleware

#### routes/user.routes.ts
typescript
import express from 'express';
import UserController from '../controllers/user.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = express.Router();
const userController = new UserController();

router.post('/register', (req, res) => userController.register(req, res));
router.post('/login', (req, res) => userController.login(req, res));

// Only authenticated users can access the following routes
router.use(authenticateToken);

// Only admins can access this route
router.get('/admin', authorizeRoles('ADMIN'), (req, res) => {
  res.send('Admin Access');
});

// Patients can access their profile
router.get('/profile', authorizeRoles('PATIENT', 'DOCTOR'), (req, res) => {
  res.send('User Profile');
});

export default router;


### Step 4: Update Doctor and Patient Routes to Use Middleware

#### routes/doctor.routes.ts
typescript
import express from 'express';
import DoctorController from '../controllers/doctor.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = express.Router();
const doctorController = new DoctorController();

router.use(authenticateToken);
router.use(authorizeRoles('DOCTOR'));

router.post('/create-timeslot', (req, res) => doctorController.createTimeSlot(req, res));
router.get('/appointments', (req, res) => doctorController.getAppointments(req, res));
router.post('/consultation', (req, res) => doctorController.recordConsultation(req, res));

export default router;


#### routes/patient.routes.ts
typescript
import express from 'express';
import PatientController from '../controllers/patient.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = express.Router();
const patientController = new PatientController();

router.use(authenticateToken);
router.use(authorizeRoles('PATIENT'));

router.post('/book-appointment', (req, res) => patientController.bookAppointment(req, res));
router.get('/doctors', (req, res) => patientController.getDoctors(req, res));
router.get('/appointments', (req, res) => patientController.getAppointments(req, res));

export default router;


### Step 5: Update Your Controllers to Fetch User Roles

Make sure your login function includes the user's role in the JWT payload.

#### controllers/auth.controller.ts (Login method)
typescript
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserService from '../services/user.service';
import { IUser } from '../interfaces/user.interface';
import Utility from '../utils/utility';

const userService = new UserService();

class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await userService.getUserByField({ email });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      Utility.handleError(res, error.message);
    }
  }

  // Other methods ...
}

export default AuthController;


### Step 6: Update UserService for Getting User by Field

Ensure your UserService class includes methods to fetch user information by field, such as email.

#### services/user.service.ts
typescript
import UserModel from '../models/user.model';
import { IUser } from '../interfaces/user.interface';

class UserService {
  async getUserByField(field: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findOne({ where: field });
  }

  // Other methods ...
}

export default UserService;


### Step 7: Testing the Role-Based Access

1. *Register a User*
   - Register both a doctor and a patient using the /register endpoint.

2. *Login*
   - Login as both users and obtain their tokens.

3. *Access Protected Routes*
   - Use the obtained tokens to access routes protected by roles and verify the appropriate access control.

### Conclusion

With these steps, you have implemented a robust role-based access control system. You now have middleware that verifies JWT tokens and checks user roles to grant or deny access to specific routes. This setup ensures that different types of users can only perform actions that are permitted for their roles. If you need further enhancements or run into any issues, feel free to ask!