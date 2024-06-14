
```markdown
# Kido Medical Backend

Kido Medical Backend is a RESTful API built using Node.js, Express.js, and Sequelize (PostgreSQL) that facilitates a medical appointment system. It allows users to register, authenticate, and manage their profiles. Doctors can manage their time slots, prescriptions, and test results, while patients can book appointments, view prescriptions, and communicate with doctors through chat.

## Features

- User Registration and Authentication
- Role-based Access Control
- OTP Email Verification
- Password Reset
- Profile Management
- Doctor Registration and Management
- Time Slot Management for Doctors
- Appointment Booking for Patients
- Prescription and Test Result Management
- Messaging between Doctors and Patients
- Image Uploads using Cloudinary
- Real-time Chat using Socket.io
- Video and Voice Call Integration

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/TabotCharlesBessong/kido_medical_backend.git
   cd kido_medical_backend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

## Configuration

1. Create a `.env` file in the root directory and add the following environment variables:

```env
APPNAME="KIDO"
DB_USERNAME="postgres"
DB_PASSWORD='postgres password'
DB_NAME="kido_medical"
DB_HOST="localhost"
DB_DIALECT="postgres"
DB_PORT=3306
DB_ALTER=false
JWT_KEY='secretkey'
MAIL_USER=' '
MAIL_PASSWORD=' '
PAYSTACK_SECRET_KEY='paystack secret key'
PAYSTACK_PUBLIC_KEY='paystack public key'
PAYSTACK_CALLBACK_URL='https://example.com'
PORT = 5000
MAILTRAP_USER = "email address to mail trap user" // create it from google
MAILTRAP_PASS = "password to mail trap user"
VERIFICATION_EMAIL = "verification email address"
PASSWORD_RESET_LINK = http://localhost:5001/reset-password.html
```

2. Set up the database:

   Ensure you have PostgreSQL installed and create a database. Update the `DATABASE_URL` in the `.env` file with your database credentials.

## Running the Project

1. Start the development server:

   ```bash
   pnpm start
   ```

   The server will start on `http://localhost:5000`.

## Project Structure

```
kido_medical_backend/
├── config/
│   ├── database.ts
│   ├── cloudinary.ts
│   └── mailer.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── doctor.controller.ts
│   ├── patient.controller.ts
│   ├── timeslot.controller.ts
│   ├── prescription.controller.ts
│   └── testResult.controller.ts
├── interfaces/
│   ├── auth.interface.ts
│   ├── doctor.interface.ts
│   ├── patient.interface.ts
│   ├── timeslot.interface.ts
│   ├── prescription.interface.ts
│   └── testResult.interface.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
├── models/
│   ├── user.model.ts
│   ├── doctor.model.ts
│   ├── patient.model.ts
│   ├── timeslot.model.ts
│   ├── prescription.model.ts
│   └── testResult.model.ts
├── routes/
│   ├── auth.router.ts
│   ├── doctor.router.ts
│   ├── patient.router.ts
│   └── index.ts
├── services/
│   ├── auth.service.ts
│   ├── doctor.service.ts
│   ├── patient.service.ts
│   ├── timeslot.service.ts
│   ├── prescription.service.ts
│   └── testResult.service.ts
├── utils/
│   ├── jwt.util.ts
│   └── otp.util.ts
├── validators/
│   ├── auth.validator.ts
│   ├── doctor.validator.ts
│   ├── patient.validator.ts
│   └── timeslot.validator.ts
├── app.ts
├── server.ts
└── README.md
```

## API Endpoints

### Authentication

- **POST** `/api/auth/register`: Register a new user.
- **POST** `/api/auth/login`: Authenticate a user and return a JWT.
- **POST** `/api/auth/verify-otp`: Verify the OTP sent to the user's email.
- **POST** `/api/auth/resend-otp`: Resend OTP to the user's email.
- **POST** `/api/auth/reset-password`: Reset the user's password.

### User Profile

- **GET** `/api/users/profile`: Get the logged-in user's profile.
- **PUT** `/api/users/profile`: Update the logged-in user's profile.

### Doctors

- **POST** `/api/doctors/create`: Create a new doctor profile (Admin only).
- **GET** `/api/doctors/:userId`: Get a doctor's profile by user ID.
- **POST** `/api/doctors/:doctorId/timeslots`: Create a new time slot for a doctor.
- **GET** `/api/doctors/:doctorId/timeslots`: Get available time slots for a doctor.

### Patients

- **POST** `/api/patients`: Create a new patient profile.
- **GET** `/api/patients/:userId`: Get a patient's profile by user ID.
- **POST** `/api/patients/:doctorId/appointments`: Book an appointment with a doctor.

### Prescriptions

- **POST** `/api/prescriptions`: Create a new prescription.
- **GET** `/api/prescriptions/:prescriptionId`: Get a prescription by ID.

### Test Results

- **POST** `/api/test-results`: Create a new test result.
- **GET** `/api/test-results/:testResultId`: Get a test result by ID.

### Messaging

- **POST** `/api/messages`: Send a message.
- **GET** `/api/messages/:conversationId`: Get messages in a conversation.

## Real-time Communication

Real-time communication between doctors and patients is handled using Socket.io for messaging and WebRTC for video and voice calls. The implementation details are found in the `controllers/chat.controller.ts` and `controllers/call.controller.ts` files.

## Image Uploads

Image uploads for profiles, prescriptions, and messages are handled using Cloudinary. The configuration is found in `config/cloudinary.ts`, and the usage examples are in the respective services.

## Running Tests

To run the tests, use the following command:

```bash
npm run test
```

This will execute all the tests defined in the `tests` directory.

## Contributions

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
```

### Conclusion

This README provides a detailed overview of your project, including installation instructions, configuration steps, project structure, and API endpoints. Make sure to replace placeholders like `your_database_url`, `your_jwt_secret`, `your_cloudinary_cloud_name`, etc., with your actual configuration values. This should help users and developers understand how to set up, run, and contribute to your project.
