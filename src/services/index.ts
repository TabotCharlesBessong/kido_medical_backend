import AppointmentDataSource from "../datasources/appointment.datasource";
import NotificationDataSource from "../datasources/notification.datasource";
import DoctorDataSource from "../datasources/doctor.datasource";
import PatientDataSource from "../datasources/patient.datasource";
import TimeSlotDataSource from "../datasources/timeslot.datasource";
import ReminderDataSource from "../datasources/reminder.datasource";
import CallDataSource from "../datasources/call.datasource";
import UserDataSource from "../datasources/user.datasource";
import TokenDataSource from "../datasources/token.datasource";
import KycVerificationDataSource from "../datasources/kycVerification.datasource";
import EmailService from "./email.service";
import { KycVerificationService } from "./kycVerfication.service";
import { DoctorService } from "./doctor.service";
import PatientService from "./patient.service";
import UserService from "./user.services";
import ReminderService from "./reminder.service";
import AppointmentService from "./appointment.service";
import TimeSlotService from "./timeslot.service";
import CallService from "./call.service";

// Datasources
const appointmentDataSource = new AppointmentDataSource();
const notificationDataSource = new NotificationDataSource();
const doctorDataSource = new DoctorDataSource();
const patientDataSource = new PatientDataSource();
const timeSlotDataSource = new TimeSlotDataSource();
const reminderDataSource = new ReminderDataSource();
const callDataSource = new CallDataSource();
const userDataSource = new UserDataSource();
const tokenDataSource = new TokenDataSource();
const kycVerificationDataSource = new KycVerificationDataSource();

// Services (except Appointment/Reminder, which are wired below)
const userService = new UserService(userDataSource, tokenDataSource);
const kycVerificationService = new KycVerificationService(kycVerificationDataSource, userService);
const doctorService = new DoctorService(doctorDataSource, EmailService, userService, kycVerificationService);
const patientService = new PatientService(patientDataSource);
const timeSlotService = new TimeSlotService();
const callService = new CallService();

// Placeholders for circular services
let appointmentService: AppointmentService;
let reminderService: ReminderService;

// Wire up circular dependencies
reminderService = new ReminderService(
  reminderDataSource,
  null as any, // appointmentService will be set after instantiation
  timeSlotService,
  doctorService,
  patientService,
  EmailService,
  callService,
  userService
);
appointmentService = new AppointmentService(
  appointmentDataSource,
  notificationDataSource,
  doctorService,
  patientService,
  EmailService,
  userService,
  timeSlotDataSource,
  reminderService,
  callService
);
(reminderService as any).appointmentService = appointmentService;

export {
  appointmentService,
  reminderService,
  doctorService,
  patientService,
  userService,
  kycVerificationService,
  timeSlotService,
  callService
}; 