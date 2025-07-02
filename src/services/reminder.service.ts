import { FindOptions, Op } from "sequelize";
import ReminderDataSource from "../datasources/reminder.datasource";
import AppointmentService from "./appointment.service";
import TimeSlotService from "./timeslot.service";
import { DoctorService } from "./doctor.service";
import PatientService from "./patient.service";
import EmailService from "./email.service";
import streamService from "./stream.service";
import CallService from "./call.service";
import { IReminder, IReminderCreationBody } from "../interfaces/reminder.interface";
import { ITimeSlot } from "../interfaces/timeslot.interface";
import fs from 'fs';
import path from 'path';
import UserService from "./user.services";
import DoctorDataSource from "../datasources/doctor.datasource";
import KycVerificationDataSource from "../datasources/kycVerification.datasource";
import { KycVerificationService } from "./kycVerfication.service";
import PatientDataSource from "../datasources/patient.datasource";
import UserDataSource from "../datasources/user.datasource";
import TokenDataSource from "../datasources/token.datasource";

const userDataSource = new UserDataSource();
const tokenDataSource = new TokenDataSource();
const userService = new UserService(userDataSource, tokenDataSource);
const kycVerificationService = new KycVerificationService(new KycVerificationDataSource(), userService);
const patientDataSource = new PatientDataSource();
const reminderDataSource = new ReminderDataSource();

class ReminderService {
  private reminderDataSource: ReminderDataSource;
  private appointmentService: AppointmentService;
  private timeSlotService: TimeSlotService;
  private doctorService: DoctorService;
  private patientService: PatientService;
  private emailService: typeof EmailService;
  private callService: CallService;
  private reminderTemplate: string;
  private userService: UserService;

  constructor(reminderDataSource: ReminderDataSource) {
    this.reminderDataSource = reminderDataSource;
    this.appointmentService = new AppointmentService();
    this.timeSlotService = new TimeSlotService();
    this.userService = userService;
    this.doctorService = new DoctorService(
      new DoctorDataSource(),
      EmailService,
      this.userService,
      kycVerificationService
    );
    this.patientService = new PatientService(patientDataSource);
    this.emailService = EmailService;
    this.callService = new CallService();
    
    // Load reminder template
    const templatePath = path.join(__dirname, '..', 'template', 'appointment-reminder.html');
    this.reminderTemplate = fs.readFileSync(templatePath, 'utf8');
  }

  private replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`#${key}#`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  async createReminders(appointmentId: string, timeSlot: ITimeSlot): Promise<void> {
    const appointment = await this.appointmentService.getAppointmentById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    const startTime = new Date(timeSlot.startTime);
    
    // Create 30-minute reminder
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

    // Create 10-minute reminder
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

  async sendReminder(reminder: IReminder): Promise<void> {
    try {
      const appointment = await this.appointmentService.getAppointmentById(reminder.appointmentId);
      if (!appointment) throw new Error("Appointment not found");
      if (appointment.status !== "CONFIRMED") return; // Skip if appointment is not confirmed

      const timeSlot = await this.timeSlotService.getTimeSlotById(appointment.timeSlotId);
      if (!timeSlot) throw new Error("Time slot not found");

      // Fetch doctor and patient
      const doctor = await this.doctorService.getDoctorByField({ where: { id: appointment.doctorId } });
      const patient = await this.patientService.getPatientById(appointment.patientId);
      if (!doctor || !patient) throw new Error("Doctor or patient not found");

      // Fetch user records for doctor and patient to get name/email
      const doctorUser = await this.userService.getUserByField({ id: doctor.userId });
      const patientUser = await this.userService.getUserByField({ id: patient.userId });
      if (!doctorUser || !patientUser) throw new Error("Doctor or patient user not found");

      const isDoctor = reminder.recipientType === "DOCTOR";
      const recipientEmail = isDoctor ? doctorUser.email : patientUser.email;
      const recipientName = isDoctor ? `${doctorUser.firstname} ${doctorUser.lastname}` : `${patientUser.firstname} ${patientUser.lastname}`;
      const counterpartName = isDoctor ? `${patientUser.firstname} ${patientUser.lastname}` : `${doctorUser.firstname} ${doctorUser.lastname}`;
      
      const timeUntil = reminder.reminderType === "30_MINUTES" ? "30 minutes" : "10 minutes";
      const appName = process.env.APPNAME || 'Kido Medical';
      const dashboardLink = `${process.env.FRONTEND_URL}/appointments/${appointment.id}`;
      
      // Get or create Stream channel if not exists
      if (!appointment.streamChannelId) {
        const channel = await streamService.createAppointmentChannel(
          appointment.id,
          appointment.doctorId,
          appointment.patientId,
          timeSlot.startTime
        );
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

      await this.emailService.sendEmail(
        recipientEmail,
        `Appointment Reminder - ${timeUntil} until your appointment`,
        emailContent
      );

      // Get associated call record
      const call = await this.callService.getCallByAppointmentId(reminder.appointmentId);

      await this.reminderDataSource.updateOne(
        { where: { id: reminder.id } },
        { status: "SENT" }
      );

      // If this is a 10-minute reminder and there's an associated call, update its status
      if (reminder.reminderType === "10_MINUTES" && call) {
        await this.callService.updateCallStatus(call.id, "PENDING");
      }
    } catch (error) {
      console.error(`Failed to send reminder: ${error}`);
      await this.reminderDataSource.updateOne(
        { where: { id: reminder.id } },
        { status: "FAILED" }
      );
      throw error;
    }
  }

  async getPendingReminders(): Promise<IReminder[]> {
    const now = new Date();
    return this.reminderDataSource.fetchAll({
      where: {
        status: "PENDING",
        scheduledFor: {
          [Op.lte]: now
        }
      }
    } as FindOptions<IReminder>);
  }

  async processReminders(): Promise<void> {
    const pendingReminders = await this.getPendingReminders();
    for (const reminder of pendingReminders) {
      await this.sendReminder(reminder);
    }
  }
}

export default ReminderService;