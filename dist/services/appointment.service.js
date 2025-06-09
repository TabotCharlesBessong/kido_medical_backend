"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appointment_datasource_1 = __importDefault(require("../datasources/appointment.datasource"));
const notification_datasource_1 = __importDefault(require("../datasources/notification.datasource"));
const doctor_service_1 = require("./doctor.service");
const patient_service_1 = __importDefault(require("./patient.service"));
const email_service_1 = __importDefault(require("./email.service"));
const user_services_1 = __importDefault(require("./user.services"));
const notification_enum_1 = require("../interfaces/enum/notification.enum");
const patient_enum_1 = require("../interfaces/enum/patient.enum");
const doctor_datasource_1 = __importDefault(require("../datasources/doctor.datasource"));
class AppointmentService {
    constructor() {
        this.appointmentDataSource = new appointment_datasource_1.default();
        this.notificationDataSource = new notification_datasource_1.default();
        this.doctorService = new doctor_service_1.DoctorService(new doctor_datasource_1.default(), email_service_1.default, new user_services_1.default());
        this.patientService = new patient_service_1.default();
        this.emailService = email_service_1.default;
        this.userService = new user_services_1.default();
    }
    createAppointment(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = Object.assign(Object.assign({}, record), { status: patient_enum_1.AppointmentStatus.PENDING });
            const createdAppointment = yield this.appointmentDataSource.create(appointment);
            // Get doctor and patient records to get their user IDs
            const doctor = yield this.doctorService.getDoctorByField({ where: { id: createdAppointment.doctorId } });
            const patient = yield this.patientService.getPatientById(createdAppointment.patientId);
            if (doctor && patient) {
                // Get user details for email
                const doctorUser = yield this.userService.getUserByField({ id: doctor.userId });
                const patientUser = yield this.userService.getUserByField({ id: patient.userId });
                if (doctorUser && patientUser) {
                    // Send email to doctor
                    yield this.emailService.sendAppointmentBookingEmail({
                        patientEmail: doctorUser.email,
                        patientName: `${patientUser.firstname} ${patientUser.lastname}`,
                        doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
                        reason: createdAppointment.reason,
                        time: createdAppointment.date.toLocaleString(),
                        appointmentId: createdAppointment.id
                    });
                    // Send email to patient
                    yield this.emailService.sendAppointmentStatusEmail({
                        patientEmail: patientUser.email,
                        patientName: `${patientUser.firstname} ${patientUser.lastname}`,
                        doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
                        reason: createdAppointment.reason,
                        time: createdAppointment.date.toLocaleString(),
                        status: 'PENDING'
                    });
                    // Notify the doctor
                    yield this.notificationDataSource.create({
                        userId: doctor.userId,
                        message: "New appointment request received",
                        type: notification_enum_1.NotificationType.APPOINTMENT,
                        referenceId: createdAppointment.id,
                        read: false,
                    });
                    // Notify the patient
                    yield this.notificationDataSource.create({
                        userId: patient.userId,
                        message: "Your appointment request has been sent",
                        type: notification_enum_1.NotificationType.APPOINTMENT,
                        referenceId: createdAppointment.id,
                        read: false,
                    });
                }
            }
            return createdAppointment;
        });
    }
    approveAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { where: { id: appointmentId } };
            const update = {
                status: patient_enum_1.AppointmentStatus.APPROVED,
            };
            yield this.appointmentDataSource.updateOne(update, filter);
            const appointment = yield this.getAppointmentById(appointmentId);
            if (appointment) {
                // Get doctor and patient records
                const doctor = yield this.doctorService.getDoctorByField({ where: { id: appointment.doctorId } });
                const patient = yield this.patientService.getPatientById(appointment.patientId);
                if (doctor && patient) {
                    // Get user details for email
                    const doctorUser = yield this.userService.getUserByField({ id: doctor.userId });
                    const patientUser = yield this.userService.getUserByField({ id: patient.userId });
                    if (doctorUser && patientUser) {
                        // Send email to patient
                        yield this.emailService.sendAppointmentStatusEmail({
                            patientEmail: patientUser.email,
                            patientName: `${patientUser.firstname} ${patientUser.lastname}`,
                            doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
                            reason: appointment.reason,
                            time: appointment.date.toLocaleString(),
                            status: 'APPROVED'
                        });
                        // Create notification
                        yield this.notificationDataSource.create({
                            userId: patient.userId,
                            message: "Your appointment has been approved",
                            type: notification_enum_1.NotificationType.APPOINTMENT_APPROVED,
                            referenceId: appointment.id,
                            read: false,
                        });
                    }
                }
            }
        });
    }
    cancelAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { where: { id: appointmentId } };
            const update = {
                status: patient_enum_1.AppointmentStatus.CANCELED,
            };
            yield this.appointmentDataSource.updateOne(update, filter);
            const appointment = yield this.getAppointmentById(appointmentId);
            if (appointment) {
                // Get doctor and patient records
                const doctor = yield this.doctorService.getDoctorByField({ where: { id: appointment.doctorId } });
                const patient = yield this.patientService.getPatientById(appointment.patientId);
                if (doctor && patient) {
                    // Get user details for email
                    const doctorUser = yield this.userService.getUserByField({ id: doctor.userId });
                    const patientUser = yield this.userService.getUserByField({ id: patient.userId });
                    if (doctorUser && patientUser) {
                        // Send email to patient
                        yield this.emailService.sendAppointmentStatusEmail({
                            patientEmail: patientUser.email,
                            patientName: `${patientUser.firstname} ${patientUser.lastname}`,
                            doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
                            reason: appointment.reason,
                            time: appointment.date.toLocaleString(),
                            status: 'CANCELED'
                        });
                        // Create notification
                        yield this.notificationDataSource.create({
                            userId: patient.userId,
                            message: "Your appointment has been canceled",
                            type: notification_enum_1.NotificationType.APPOINTMENT_CANCELED,
                            referenceId: appointment.id,
                            read: false,
                        });
                    }
                }
            }
        });
    }
    getAppointmentById(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.appointmentDataSource.fetchOne({
                where: { id: appointmentId },
            });
        });
    }
    updateAppointment(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { where: { id } };
            yield this.appointmentDataSource.updateOne(data, filter);
        });
    }
    getAppointments() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.appointmentDataSource.fetchAll(query);
        });
    }
    getAppointmentsByPatient(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                where: { patientId },
                raw: true,
                order: [['createdAt', 'DESC']] // Most recent first
            };
            return this.appointmentDataSource.fetchAll(query);
        });
    }
}
exports.default = AppointmentService;
