Sure, let's continue from where we left off, implementing the routes for password reset functionality:

### Step 6: Continued

#### routes/auth.routes.ts (continued)
typescript
import express from 'express';
import AuthController from '../controllers/auth.controller';

const router = express.Router();
const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/verify-otp', (req, res) => authController.verifyOTP(req, res));
router.post('/request-password-reset', (req, res) => authController.requestPasswordReset(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

export default router;


### Step 7: Implement Image Upload Using Cloudinary

#### utils/cloudinary.utils.ts
typescript
import cloudinary from '../config/cloudinary';

export const uploadImage = async (filePath: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath);
  return result.secure_url;
};


#### controllers/upload.controller.ts
typescript
import { Request, Response } from 'express';
import { uploadImage } from '../utils/cloudinary.utils';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

class UploadController {
  async uploadImage(req: Request, res: Response) {
    try {
      const filePath = req.file.path;
      const imageUrl = await uploadImage(filePath);
      res.status(200).json({ imageUrl });
    } catch (error) {
      res.status(500).json({ error: 'Image upload failed' });
    }
  }
}

const uploadController = new UploadController();

export { upload, uploadController };


#### routes/upload.routes.ts
typescript
import express from 'express';
import { upload, uploadController } from '../controllers/upload.controller';

const router = express.Router();

router.post('/image', upload.single('image'), (req, res) => uploadController.uploadImage(req, res));

export default router;


### Step 8: Update Your Express App

#### app.ts
typescript
import express from 'express';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

export default app;


### Step 9: Environment Variables

Update your .env file to include Cloudinary and email service credentials:

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_pass
FRONTEND_URL=http://localhost:3000


### Step 10: Sample Verification and Password Reset Workflow

#### Register a User
- User registers via /api/auth/register.
- An OTP is sent to the user's email.

#### Verify OTP
- User verifies OTP via /api/auth/verify-otp with email and OTP.

#### Request Password Reset
- User requests password reset via /api/auth/request-password-reset with email.

#### Reset Password
- User resets password via /api/auth/reset-password with token and new password.

### Step 11: Image Upload
- User uploads an image via /api/upload/image with a multipart/form-data request.

### Conclusion
The code above integrates OTP verification, password reset, and image upload functionality into your backend, maintaining a clean, layered architecture. If

you encounter any issues or need further customization, feel free to ask for more assistance! Below is the continuation of the implementation including the final bits of code and integration steps.

### Step 10: Finalizing and Testing

To ensure all features are integrated smoothly, let's finalize our setup and perform some testing.

#### app.ts (continued)
typescript
import express from 'express';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import doctorRoutes from './routes/doctor.routes';  // Make sure you have the doctor routes

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/doctors', doctorRoutes);  // Ensure you add other routes similarly

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;


### Step 11: Running and Testing

Make sure your database is properly set up and running. Run migrations if you have them.

#### Running the Server
bash
npm start


Ensure you have all environment variables set in a .env file or environment configuration.

#### Testing the Features

1. *Register a User*
   - Endpoint: POST /api/auth/register
   - Body: { "username": "user1", "email": "user1@example.com", "password": "password123", "firstname": "John", "lastname": "Doe" }
   - Expected: User registration, OTP sent to email.

2. *Verify OTP*
   - Endpoint: POST /api/auth/verify-otp
   - Body: { "email": "user1@example.com", "otp": "the-otp-code" }
   - Expected: Successful OTP verification, user email marked as verified.

3. *Request Password Reset*
   - Endpoint: POST /api/auth/request-password-reset
   - Body: { "email": "user1@example.com" }
   - Expected: Password reset link sent to email.

4. *Reset Password*
   - Endpoint: POST /api/auth/reset-password
   - Body: { "token": "the-reset-token", "newPassword": "newpassword123" }
   - Expected: Password reset successfully.

5. *Upload an Image*
   - Endpoint: POST /api/upload/image
   - Form Data: File under the key image.
   - Expected: Image uploaded and URL returned.

### Enhancements and Best Practices

1. *Security Enhancements*
   - Use environment variables securely.
   - Hash sensitive data.
   - Validate all inputs.

2. *Logging and Monitoring*
   - Implement proper logging for errors and important actions.
   - Consider using services like Sentry for error tracking.

3. *Testing*
   - Write unit and integration tests for all endpoints.
   - Use tools like Jest and Supertest for testing your Express app.

4. *Documentation*
   - Document your API endpoints using tools like Swagger or Postman.

### Conclusion

The extended backend now supports OTP verification, password reset functionality, and image uploads using Cloudinary, integrated within the layered architecture of your application. Each component was designed to maintain clean code practices and enhance the application's security and usability.

If you need further enhancements or run into any issues, feel free to ask!