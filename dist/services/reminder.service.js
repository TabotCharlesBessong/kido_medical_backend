"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const reminder_datasource_1 = __importDefault(require("../datasources/reminder.datasource"));
const stream_service_1 = __importDefault(require("./stream.service"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const user_services_1 = __importDefault(require("./user.services"));
const kycVerification_datasource_1 = __importDefault(require("../datasources/kycVerification.datasource"));
const kycVerfication_service_1 = require("./kycVerfication.service");
const patient_datasource_1 = __importDefault(require("../datasources/patient.datasource"));
const user_datasource_1 = __importDefault(require("../datasources/user.datasource"));
const token_datasource_1 = __importDefault(require("../datasources/token.datasource"));
const userDataSource = new user_datasource_1.default();
const tokenDataSource = new token_datasource_1.default();
const userService = new user_services_1.default(userDataSource, tokenDataSource);
const kycVerificationService = new kycVerfication_service_1.KycVerificationService(new kycVerification_datasource_1.default(), userService);
const patientDataSource = new patient_datasource_1.default();
const reminderDataSource = new reminder_datasource_1.default();
class ReminderService {
    constructor(reminderDataSource, appointmentService, timeSlotService, doctorService, patientService, emailService, callService, userService) {
        this.reminderDataSource = reminderDataSource;
        this.appointmentService = appointmentService;
        this.timeSlotService = timeSlotService;
        this.doctorService = doctorService;
        this.patientService = patientService;
        this.emailService = emailService;
        this.callService = callService;
        this.userService = userService;
        const templatePath = path_1.default.join(__dirname, '..', 'template', 'appointment-reminder.html');
        this.reminderTemplate = fs_1.default.readFileSync(templatePath, 'utf8');
    }
    replaceTemplateVariables(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`#${key}#`, 'g');
            result = result.replace(regex, value);
        }
        return result;
    }
    async createReminders(appointmentId, timeSlot) {
        const appointment = await this.appointmentService.getAppointmentById(appointmentId);
        if (!appointment)
            throw new Error("Appointment not found");
        const startTime = new Date(timeSlot.startTime);
        const thirtyMinBefore = new Date(startTime.getTime() - 30 * 60000);
        await this.reminderDataSource.create({
            appointmentId,
            recipientId: appointment.doctorId,
            recipientType: "DOCTOR",
            reminderType: "30_MINUTES",
            scheduledFor: thirtyMinBefore
        });
        await this.reminderDataSource.create({
            appointmentId,
            recipientId: appointment.patientId,
            recipientType: "PATIENT",
            reminderType: "30_MINUTES",
            scheduledFor: thirtyMinBefore
        });
        const tenMinBefore = new Date(startTime.getTime() - 10 * 60000);
        await this.reminderDataSource.create({
            appointmentId,
            recipientId: appointment.doctorId,
            recipientType: "DOCTOR",
            reminderType: "10_MINUTES",
            scheduledFor: tenMinBefore
        });
        await this.reminderDataSource.create({
            appointmentId,
            recipientId: appointment.patientId,
            recipientType: "PATIENT",
            reminderType: "10_MINUTES",
            scheduledFor: tenMinBefore
        });
    }
    async sendReminder(reminder) {
        try {
            const appointment = await this.appointmentService.getAppointmentById(reminder.appointmentId);
            if (!appointment)
                throw new Error("Appointment not found");
            if (appointment.status !== "CONFIRMED")
                return;
            const timeSlot = await this.timeSlotService.getTimeSlotById(appointment.timeSlotId);
            if (!timeSlot)
                throw new Error("Time slot not found");
            const doctor = await this.doctorService.getDoctorByField({ where: { id: appointment.doctorId } });
            const patient = await this.patientService.getPatientById(appointment.patientId);
            if (!doctor || !patient)
                throw new Error("Doctor or patient not found");
            const doctorUser = await this.userService.getUserByField({ id: doctor.userId });
            const patientUser = await this.userService.getUserByField({ id: patient.userId });
            if (!doctorUser || !patientUser)
                throw new Error("Doctor or patient user not found");
            const isDoctor = reminder.recipientType === "DOCTOR";
            const recipientEmail = isDoctor ? doctorUser.email : patientUser.email;
            const recipientName = isDoctor ? `${doctorUser.firstname} ${doctorUser.lastname}` : `${patientUser.firstname} ${patientUser.lastname}`;
            const counterpartName = isDoctor ? `${patientUser.firstname} ${patientUser.lastname}` : `${doctorUser.firstname} ${doctorUser.lastname}`;
            const timeUntil = reminder.reminderType === "30_MINUTES" ? "30 minutes" : "10 minutes";
            const appName = process.env.APPNAME || 'Kido Medical';
            const dashboardLink = `${process.env.FRONTEND_URL}/appointments/${appointment.id}`;
            if (!appointment.streamChannelId) {
                const channel = await stream_service_1.default.createAppointmentChannel(appointment.id, appointment.doctorId, appointment.patientId, timeSlot.startTime);
                if (channel && channel.id) {
                    await this.appointmentService.updateAppointment(appointment.id, { streamChannelId: channel.id });
                }
            }
            const emailContent = this.replaceTemplateVariables(this.reminderTemplate, {
                RECIPIENT_NAME: recipientName,
                APPOINTMENT_TIME: timeSlot.startTime.toLocaleString(),
                COUNTERPART_ROLE: isDoctor ? "Patient" : "Doctor",
                COUNTERPART_NAME: counterpartName,
                TIME_UNTIL: timeUntil,
                DASHBOARD_LINK: dashboardLink,
                APP_NAME: appName
            });
            await this.emailService.sendEmail(recipientEmail, `Appointment Reminder - ${timeUntil} until your appointment`, emailContent);
            const call = await this.callService.getCallByAppointmentId(reminder.appointmentId);
            await this.reminderDataSource.updateOne({ where: { id: reminder.id } }, { status: "SENT" });
            if (reminder.reminderType === "10_MINUTES" && call) {
                await this.callService.updateCallStatus(call.id, "PENDING");
            }
        }
        catch (error) {
            console.error(`Failed to send reminder: ${error}`);
            await this.reminderDataSource.updateOne({ where: { id: reminder.id } }, { status: "FAILED" });
            throw error;
        }
    }
    async getPendingReminders() {
        const now = new Date();
        return this.reminderDataSource.fetchAll({
            where: {
                status: "PENDING",
                scheduledFor: {
                    [sequelize_1.Op.lte]: now
                }
            }
        });
    }
    async processReminders() {
        const pendingReminders = await this.getPendingReminders();
        for (const reminder of pendingReminders) {
            await this.sendReminder(reminder);
        }
    }
}
exports.default = ReminderService;
