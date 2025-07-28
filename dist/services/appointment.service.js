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
const user_services_1 = __importDefault(require("./user.services"));
const stream_service_1 = __importDefault(require("./stream.service"));
const kycVerification_datasource_1 = __importDefault(require("../datasources/kycVerification.datasource"));
const kycVerfication_service_1 = require("./kycVerfication.service");
const patient_datasource_1 = __importDefault(require("../datasources/patient.datasource"));
const user_datasource_1 = __importDefault(require("../datasources/user.datasource"));
const token_datasource_1 = __importDefault(require("../datasources/token.datasource"));
const reminder_datasource_1 = __importDefault(require("../datasources/reminder.datasource"));
const userDataSource = new user_datasource_1.default();
const tokenDataSource = new token_datasource_1.default();
const userService = new user_services_1.default(userDataSource, tokenDataSource);
const kycVerificationService = new kycVerfication_service_1.KycVerificationService(new kycVerification_datasource_1.default(), userService);
const patientDataSource = new patient_datasource_1.default();
const reminderDataSource = new reminder_datasource_1.default();
class AppointmentService {
    constructor(appointmentDataSource, notificationDataSource, doctorService, patientService, emailService, userService, timeSlotDataSource, reminderService, callService) {
        this.appointmentDataSource = appointmentDataSource;
        this.notificationDataSource = notificationDataSource;
        this.doctorService = doctorService;
        this.patientService = patientService;
        this.emailService = emailService;
        this.userService = userService;
        this.timeSlotDataSource = timeSlotDataSource;
        this.reminderService = reminderService;
        this.callService = callService;
    }
    createAppointment(record) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the time slot to get the start time
            const timeSlot = yield this.timeSlotDataSource.fetchOne({
                where: { id: record.timeSlotId },
                returning: true
            });
            if (!timeSlot) {
                throw new Error("Time slot not found");
            }
            // Create the appointment
            const createdAppointment = yield this.appointmentDataSource.create(record);
            // Create Stream channel for the appointment
            const streamChannel = yield stream_service_1.default.createAppointmentChannel(createdAppointment.id, createdAppointment.doctorId, createdAppointment.patientId, timeSlot.startTime);
            if (!streamChannel || !streamChannel.id) {
                throw new Error("Failed to create Stream channel");
            }
            // Update appointment with Stream channel ID
            yield this.appointmentDataSource.updateOne({ where: { id: createdAppointment.id } }, { streamChannelId: streamChannel.id });
            // Create a pending call record
            yield this.callService.createCall({
                doctorId: createdAppointment.doctorId,
                patientId: createdAppointment.patientId,
                appointmentId: createdAppointment.id,
                status: "PENDING"
            });
            // Return the updated appointment
            const updatedAppointment = yield this.appointmentDataSource.fetchOne({
                where: { id: createdAppointment.id },
            });
            if (!updatedAppointment) {
                throw new Error("Failed to fetch updated appointment");
            }
            return updatedAppointment;
        });
    }
    getAppointmentById(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.appointmentDataSource.fetchOne({
                where: { id: appointmentId },
            });
        });
    }
    getAppointmentsByDoctorId(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointments = yield this.appointmentDataSource.fetchAll({
                where: { doctorId },
            });
            return appointments.map((appointment) => ({
                id: appointment.id,
                doctorId: appointment.doctorId,
                patientId: appointment.patientId,
                timeSlotId: appointment.timeSlotId,
                status: appointment.status,
                streamChannelId: appointment.streamChannelId,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
            }));
        });
    }
    getAppointmentsByPatientId(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointments = yield this.appointmentDataSource.fetchAll({
                where: { patientId },
            });
            return appointments.map((appointment) => ({
                id: appointment.id,
                doctorId: appointment.doctorId,
                patientId: appointment.patientId,
                timeSlotId: appointment.timeSlotId,
                status: appointment.status,
                streamChannelId: appointment.streamChannelId,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
            }));
        });
    }
    updateAppointmentStatus(appointmentId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { where: { id: appointmentId } };
            const update = { status };
            yield this.appointmentDataSource.updateOne(filter, update);
            const updatedAppointment = yield this.appointmentDataSource.fetchOne({
                where: { id: appointmentId },
            });
            if (!updatedAppointment) {
                throw new Error("Failed to fetch updated appointment");
            }
            return updatedAppointment;
        });
    }
    approveAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.getAppointmentById(appointmentId);
            if (!appointment) {
                throw new Error("Appointment not found");
            }
            if (appointment.status !== "PENDING") {
                throw new Error("Only pending appointments can be approved");
            }
            // Get the time slot for the appointment
            const timeSlot = yield this.timeSlotDataSource.fetchOne({
                where: { id: appointment.timeSlotId },
                returning: true
            });
            if (!timeSlot) {
                throw new Error("Time slot not found");
            }
            // Update appointment status to CONFIRMED
            const updatedAppointment = yield this.updateAppointmentStatus(appointmentId, "CONFIRMED");
            // Create reminders for both doctor and patient
            yield this.reminderService.createReminders(appointmentId, timeSlot);
            // If there's a Stream channel, update its metadata
            if (updatedAppointment.streamChannelId) {
                yield stream_service_1.default.updateChannelMetadata(updatedAppointment.streamChannelId, {
                    status: "CONFIRMED",
                    appointmentId: updatedAppointment.id
                });
                // Update associated call status
                const call = yield this.callService.getCallByAppointmentId(appointmentId);
                if (call) {
                    yield this.callService.updateCallStatus(call.id, "PENDING");
                }
            }
            return updatedAppointment;
        });
    }
    cancelAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.getAppointmentById(appointmentId);
            if (!appointment) {
                throw new Error("Appointment not found");
            }
            if (appointment.status === "COMPLETED") {
                throw new Error("Completed appointments cannot be cancelled");
            }
            // Update appointment status to CANCELLED
            const updatedAppointment = yield this.updateAppointmentStatus(appointmentId, "CANCELLED");
            // If there's a Stream channel, update its metadata
            if (updatedAppointment.streamChannelId) {
                yield stream_service_1.default.updateChannelMetadata(updatedAppointment.streamChannelId, {
                    status: "CANCELLED",
                    appointmentId: updatedAppointment.id
                });
            }
            return updatedAppointment;
        });
    }
    getAllAppointments() {
        return __awaiter(this, void 0, void 0, function* () {
            const appointments = yield this.appointmentDataSource.fetchAll({
                where: {},
            });
            return appointments.map((appointment) => ({
                id: appointment.id,
                doctorId: appointment.doctorId,
                patientId: appointment.patientId,
                timeSlotId: appointment.timeSlotId,
                status: appointment.status,
                streamChannelId: appointment.streamChannelId,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
            }));
        });
    }
    deleteAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.appointmentDataSource.fetchOne({
                where: { id: appointmentId },
            });
            if (!appointment) {
                throw new Error("Appointment not found");
            }
            yield this.appointmentDataSource.deleteOne({
                where: { id: appointmentId },
            });
        });
    }
    updateAppointment(appointmentId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.appointmentDataSource.updateOne({ where: { id: appointmentId } }, data);
            const appointment = yield this.getAppointmentById(appointmentId);
            if (!appointment) {
                throw new Error("Failed to retrieve updated appointment");
            }
            // If status is being updated, update Stream channel metadata
            if (data.status && appointment.streamChannelId) {
                yield stream_service_1.default.updateChannelMetadata(appointment.streamChannelId, {
                    status: data.status,
                });
            }
            return appointment;
        });
    }
}
exports.default = AppointmentService;
