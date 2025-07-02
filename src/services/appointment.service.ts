import AppointmentDataSource from "../datasources/appointment.datasource";
import NotificationDataSource from "../datasources/notification.datasource";
import { DoctorService } from "./doctor.service";
import PatientService from "./patient.service";
import EmailService from "./email.service";
import UserService from "./user.services";
import {
  IAppointmentCreationBody,
  IAppointment,
  IAppointmentDataSource,
  IFindAppointmentQuery,
} from "../interfaces/appointment.interface";
import { NotificationType } from "../interfaces/enum/notification.enum";
import { AppointmentStatus } from "../interfaces/enum/patient.enum";
import { INotificationDataSource } from "../interfaces/notification.interface";
import { FindOptions } from "sequelize";
import DoctorDataSource from "../datasources/doctor.datasource";
import TimeSlotDataSource from "../datasources/timeslot.datasource";
import streamService from "./stream.service";
import ReminderService from "./reminder.service";
import CallService from "./call.service";
import KycVerificationDataSource from "../datasources/kycVerification.datasource";
import { KycVerificationService } from "./kycVerfication.service";
import PatientDataSource from "../datasources/patient.datasource";
import UserDataSource from "../datasources/user.datasource";
import TokenDataSource from "../datasources/token.datasource";
import ReminderDataSource from "../datasources/reminder.datasource";

const userDataSource = new UserDataSource();
const tokenDataSource = new TokenDataSource();
const userService = new UserService(userDataSource, tokenDataSource);
const kycVerificationService = new KycVerificationService(new KycVerificationDataSource(), userService);
const patientDataSource = new PatientDataSource();
const reminderDataSource = new ReminderDataSource();

class AppointmentService {
  private appointmentDataSource: AppointmentDataSource;
  private notificationDataSource: NotificationDataSource;
  private doctorService: DoctorService;
  private patientService: PatientService;
  private emailService: typeof EmailService;
  private userService: UserService;
  private timeSlotDataSource: TimeSlotDataSource;
  private reminderService: ReminderService;
  private callService: CallService;

  constructor(
    appointmentDataSource: AppointmentDataSource,
    notificationDataSource: NotificationDataSource,
    doctorService: DoctorService,
    patientService: PatientService,
    emailService: typeof EmailService,
    userService: UserService,
    timeSlotDataSource: TimeSlotDataSource,
    reminderService: ReminderService,
    callService: CallService
  ) {
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

  async createAppointment(record: IAppointmentCreationBody): Promise<IAppointment> {
    // Get the time slot to get the start time
    const timeSlot = await this.timeSlotDataSource.fetchOne({
      where: { id: record.timeSlotId },
      returning: true
    });

    if (!timeSlot) {
      throw new Error("Time slot not found");
    }

    // Create the appointment
    const createdAppointment = await this.appointmentDataSource.create(record);

    // Create Stream channel for the appointment
    const streamChannel = await streamService.createAppointmentChannel(
      createdAppointment.id,
      createdAppointment.doctorId,
      createdAppointment.patientId,
      timeSlot.startTime
    );

    if (!streamChannel || !streamChannel.id) {
      throw new Error("Failed to create Stream channel");
    }

    // Update appointment with Stream channel ID
    await this.appointmentDataSource.updateOne(
      { where: { id: createdAppointment.id } },
      { streamChannelId: streamChannel.id }
    );

    // Create a pending call record
    await this.callService.createCall({
      doctorId: createdAppointment.doctorId,
      patientId: createdAppointment.patientId,
      appointmentId: createdAppointment.id,
      status: "PENDING"
    });

    // Return the updated appointment
    const updatedAppointment = await this.appointmentDataSource.fetchOne({
      where: { id: createdAppointment.id },
    });

    if (!updatedAppointment) {
      throw new Error("Failed to fetch updated appointment");
    }

    return updatedAppointment;
  }

  async getAppointmentById(appointmentId: string): Promise<IAppointment | null> {
    return await this.appointmentDataSource.fetchOne({
      where: { id: appointmentId },
    });
  }

  async getAppointmentsByDoctorId(doctorId: string): Promise<IAppointment[]> {
    const appointments = await this.appointmentDataSource.fetchAll({
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
  }

  async getAppointmentsByPatientId(patientId: string): Promise<IAppointment[]> {
    const appointments = await this.appointmentDataSource.fetchAll({
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
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  ): Promise<IAppointment> {
    const filter = { where: { id: appointmentId } };
    const update = { status };

    await this.appointmentDataSource.updateOne(filter, update);

    const updatedAppointment = await this.appointmentDataSource.fetchOne({
      where: { id: appointmentId },
    });

    if (!updatedAppointment) {
      throw new Error("Failed to fetch updated appointment");
    }

    return updatedAppointment;
  }

  async approveAppointment(appointmentId: string): Promise<IAppointment> {
    const appointment = await this.getAppointmentById(appointmentId);
    
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.status !== "PENDING") {
      throw new Error("Only pending appointments can be approved");
    }

    // Get the time slot for the appointment
    const timeSlot = await this.timeSlotDataSource.fetchOne({
      where: { id: appointment.timeSlotId },
      returning: true
    });

    if (!timeSlot) {
      throw new Error("Time slot not found");
    }

    // Update appointment status to CONFIRMED
    const updatedAppointment = await this.updateAppointmentStatus(appointmentId, "CONFIRMED");

    // Create reminders for both doctor and patient
    await this.reminderService.createReminders(appointmentId, timeSlot);

    // If there's a Stream channel, update its metadata
    if (updatedAppointment.streamChannelId) {
      await streamService.updateChannelMetadata(updatedAppointment.streamChannelId, {
        status: "CONFIRMED",
        appointmentId: updatedAppointment.id
      });

      // Update associated call status
      const call = await this.callService.getCallByAppointmentId(appointmentId);
      if (call) {
        await this.callService.updateCallStatus(call.id, "PENDING");
      }
    }

    return updatedAppointment;
  }

  async cancelAppointment(appointmentId: string): Promise<IAppointment> {
    const appointment = await this.getAppointmentById(appointmentId);
    
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.status === "COMPLETED") {
      throw new Error("Completed appointments cannot be cancelled");
    }

    // Update appointment status to CANCELLED
    const updatedAppointment = await this.updateAppointmentStatus(appointmentId, "CANCELLED");

    // If there's a Stream channel, update its metadata
    if (updatedAppointment.streamChannelId) {
      await streamService.updateChannelMetadata(updatedAppointment.streamChannelId, {
        status: "CANCELLED",
        appointmentId: updatedAppointment.id
      });
    }

    return updatedAppointment;
  }

  async getAllAppointments(): Promise<IAppointment[]> {
    const appointments = await this.appointmentDataSource.fetchAll({
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
  }

  async deleteAppointment(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentDataSource.fetchOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    await this.appointmentDataSource.deleteOne({
      where: { id: appointmentId },
    });
  }

  async updateAppointment(appointmentId: string, data: Partial<IAppointment>): Promise<IAppointment> {
    await this.appointmentDataSource.updateOne(
      { where: { id: appointmentId } },
      data
    );

    const appointment = await this.getAppointmentById(appointmentId);
    if (!appointment) {
      throw new Error("Failed to retrieve updated appointment");
    }

    // If status is being updated, update Stream channel metadata
    if (data.status && appointment.streamChannelId) {
      await streamService.updateChannelMetadata(appointment.streamChannelId, {
        status: data.status,
      });
    }

    return appointment;
  }
}

export default AppointmentService;
