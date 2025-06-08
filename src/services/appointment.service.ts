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

class AppointmentService {
  private appointmentDataSource: AppointmentDataSource;
  private notificationDataSource: NotificationDataSource;
  private doctorService: DoctorService;
  private patientService: PatientService;
  private emailService: typeof EmailService;
  private userService: UserService;
  private timeSlotDataSource: TimeSlotDataSource;

  constructor() {
    this.appointmentDataSource = new AppointmentDataSource();
    this.notificationDataSource = new NotificationDataSource();
    this.doctorService = new DoctorService(
      new DoctorDataSource(),
      EmailService,
      new UserService()
    );
    this.patientService = new PatientService();
    this.emailService = EmailService;
    this.userService = new UserService();
    this.timeSlotDataSource = new TimeSlotDataSource();
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

    // Update appointment status to CONFIRMED
    const updatedAppointment = await this.updateAppointmentStatus(appointmentId, "CONFIRMED");

    // If there's a Stream channel, update its metadata
    if (updatedAppointment.streamChannelId) {
      await streamService.updateChannelMetadata(updatedAppointment.streamChannelId, {
        status: "CONFIRMED",
        appointmentId: updatedAppointment.id
      });
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
}

export default AppointmentService;
