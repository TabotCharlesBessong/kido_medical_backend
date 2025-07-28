"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callService = exports.timeSlotService = exports.kycVerificationService = exports.userService = exports.patientService = exports.doctorService = exports.reminderService = exports.appointmentService = void 0;
const appointment_datasource_1 = __importDefault(require("../datasources/appointment.datasource"));
const notification_datasource_1 = __importDefault(require("../datasources/notification.datasource"));
const doctor_datasource_1 = __importDefault(require("../datasources/doctor.datasource"));
const patient_datasource_1 = __importDefault(require("../datasources/patient.datasource"));
const timeslot_datasource_1 = __importDefault(require("../datasources/timeslot.datasource"));
const reminder_datasource_1 = __importDefault(require("../datasources/reminder.datasource"));
const call_datasource_1 = __importDefault(require("../datasources/call.datasource"));
const user_datasource_1 = __importDefault(require("../datasources/user.datasource"));
const token_datasource_1 = __importDefault(require("../datasources/token.datasource"));
const kycVerification_datasource_1 = __importDefault(require("../datasources/kycVerification.datasource"));
const email_service_1 = __importDefault(require("./email.service"));
const kycVerfication_service_1 = require("./kycVerfication.service");
const doctor_service_1 = require("./doctor.service");
const patient_service_1 = __importDefault(require("./patient.service"));
const user_services_1 = __importDefault(require("./user.services"));
const reminder_service_1 = __importDefault(require("./reminder.service"));
const appointment_service_1 = __importDefault(require("./appointment.service"));
const timeslot_service_1 = __importDefault(require("./timeslot.service"));
const call_service_1 = __importDefault(require("./call.service"));
// Datasources
const appointmentDataSource = new appointment_datasource_1.default();
const notificationDataSource = new notification_datasource_1.default();
const doctorDataSource = new doctor_datasource_1.default();
const patientDataSource = new patient_datasource_1.default();
const timeSlotDataSource = new timeslot_datasource_1.default();
const reminderDataSource = new reminder_datasource_1.default();
const callDataSource = new call_datasource_1.default();
const userDataSource = new user_datasource_1.default();
const tokenDataSource = new token_datasource_1.default();
const kycVerificationDataSource = new kycVerification_datasource_1.default();
// Services (except Appointment/Reminder, which are wired below)
const userService = new user_services_1.default(userDataSource, tokenDataSource);
exports.userService = userService;
const kycVerificationService = new kycVerfication_service_1.KycVerificationService(kycVerificationDataSource, userService);
exports.kycVerificationService = kycVerificationService;
const doctorService = new doctor_service_1.DoctorService(doctorDataSource, email_service_1.default, userService, kycVerificationService);
exports.doctorService = doctorService;
const patientService = new patient_service_1.default(patientDataSource);
exports.patientService = patientService;
const timeSlotService = new timeslot_service_1.default();
exports.timeSlotService = timeSlotService;
const callService = new call_service_1.default();
exports.callService = callService;
// Placeholders for circular services
let appointmentService;
let reminderService;
// Wire up circular dependencies
exports.reminderService = reminderService = new reminder_service_1.default(reminderDataSource, null, // appointmentService will be set after instantiation
timeSlotService, doctorService, patientService, email_service_1.default, callService, userService);
exports.appointmentService = appointmentService = new appointment_service_1.default(appointmentDataSource, notificationDataSource, doctorService, patientService, email_service_1.default, userService, timeSlotDataSource, reminderService, callService);
reminderService.appointmentService = appointmentService;
