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

  async createAppointment(
    record: Partial<IAppointment>
  ): Promise<IAppointment> {
    const appointment = {
      ...record,
      status: AppointmentStatus.PENDING,
    } as IAppointmentCreationBody;

    // Get the time slot to get the start time
    const timeSlot = await this.timeSlotDataSource.fetchOne({
      where: { id: record.timeSlotId },
    });

    if (!timeSlot) {
      throw new Error("Time slot not found");
    }

    // Create the appointment
    const createdAppointment = await this.appointmentDataSource.create(
      appointment
    );

    // Create Stream channel for the appointment
    const streamChannel = await streamService.createAppointmentChannel(
      createdAppointment.id,
      createdAppointment.doctorId,
      createdAppointment.patientId,
      timeSlot.startTime
    );

    // Update appointment with Stream channel ID
    await this.appointmentDataSource.updateOne(
      { where: { id: createdAppointment.id } },
      { streamChannelId: streamChannel.channelId }
    );

    // Get doctor and patient records to get their user IDs
    const doctor = await this.doctorService.getDoctorByField({ where: { id: createdAppointment.doctorId } });
    const patient = await this.patientService.getPatientById(createdAppointment.patientId);

    if (doctor && patient) {
      // Get user details for email
      const doctorUser = await this.userService.getUserByField({id: doctor.userId});
      const patientUser = await this.userService.getUserByField({id: patient.userId});

      if (doctorUser && patientUser) {
        // Send email to doctor
        await this.emailService.sendAppointmentBookingEmail({
          patientEmail: doctorUser.email,
          patientName: `${patientUser.firstname} ${patientUser.lastname}`,
          doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
          reason: createdAppointment.reason,
          time: createdAppointment.date.toLocaleString(),
          appointmentId: createdAppointment.id
        });

        // Send email to patient
        await this.emailService.sendAppointmentStatusEmail({
          patientEmail: patientUser.email,
          patientName: `${patientUser.firstname} ${patientUser.lastname}`,
          doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
          reason: createdAppointment.reason,
          time: createdAppointment.date.toLocaleString(),
          status: 'PENDING'
        });

        // Notify the doctor
        await this.notificationDataSource.create({
          userId: doctor.userId,
          message: "New appointment request received",
          type: NotificationType.APPOINTMENT,
          referenceId: createdAppointment.id,
          read: false,
        });

        // Notify the patient
        await this.notificationDataSource.create({
          userId: patient.userId,
          message: "Your appointment request has been sent",
          type: NotificationType.APPOINTMENT,
          referenceId: createdAppointment.id,
          read: false,
        });
      }
    }

    return {
      ...createdAppointment,
      streamChannelId: streamChannel.channelId,
    };
  }

  async approveAppointment(appointmentId: string): Promise<void> {
    const filter = { where: { id: appointmentId } };
    const update = {
      status: AppointmentStatus.APPROVED,
    };
    await this.appointmentDataSource.updateOne(update, filter);
    const appointment = await this.getAppointmentById(appointmentId);

    if (appointment) {
      // Get doctor and patient records
      const doctor = await this.doctorService.getDoctorByField({ where: { id: appointment.doctorId } });
      const patient = await this.patientService.getPatientById(appointment.patientId);

      if (doctor && patient) {
        // Get user details for email
        const doctorUser = await this.userService.getUserByField({id: doctor.userId});
        const patientUser = await this.userService.getUserByField({id: patient.userId});

        if (doctorUser && patientUser) {
          // Send email to patient
          await this.emailService.sendAppointmentStatusEmail({
            patientEmail: patientUser.email,
            patientName: `${patientUser.firstname} ${patientUser.lastname}`,
            doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
            reason: appointment.reason,
            time: appointment.date.toLocaleString(),
            status: 'APPROVED'
          });

          // Create notification
          await this.notificationDataSource.create({
            userId: patient.userId,
            message: "Your appointment has been approved",
            type: NotificationType.APPOINTMENT_APPROVED,
            referenceId: appointment.id,
            read: false,
          });
        }
      }
    }
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    const filter = { where: { id: appointmentId } };
    const update = {
      status: AppointmentStatus.CANCELED,
    };
    await this.appointmentDataSource.updateOne(update, filter);
    const appointment = await this.getAppointmentById(appointmentId);

    if (appointment) {
      // Get doctor and patient records
      const doctor = await this.doctorService.getDoctorByField({ where: { id: appointment.doctorId } });
      const patient = await this.patientService.getPatientById(appointment.patientId);

      if (doctor && patient) {
        // Get user details for email
        const doctorUser = await this.userService.getUserByField({id: doctor.userId});
        const patientUser = await this.userService.getUserByField({id: patient.userId});

        if (doctorUser && patientUser) {
          // Send email to patient
          await this.emailService.sendAppointmentStatusEmail({
            patientEmail: patientUser.email,
            patientName: `${patientUser.firstname} ${patientUser.lastname}`,
            doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
            reason: appointment.reason,
            time: appointment.date.toLocaleString(),
            status: 'CANCELED'
          });

          // Create notification
          await this.notificationDataSource.create({
            userId: patient.userId,
            message: "Your appointment has been canceled",
            type: NotificationType.APPOINTMENT_CANCELED,
            referenceId: appointment.id,
            read: false,
          });
        }
      }
    }
  }

  async getAppointmentById(
    appointmentId: string
  ): Promise<IAppointment | null> {
    return await this.appointmentDataSource.fetchOne({
      where: { id: appointmentId },
    });
  }

  async updateAppointment(
    id: string,
    data: Partial<IAppointment>
  ): Promise<void> {
    const filter = { where: { id } } as IFindAppointmentQuery;
    await this.appointmentDataSource.updateOne(data, filter);
  }

  async getAppointments(): Promise<IAppointment[]> {
    const query = { where: {}, raw: true };
    return this.appointmentDataSource.fetchAll(query);
  }

  async getAppointmentsByPatient(patientId: string): Promise<IAppointment[]> {
    const query: FindOptions<IAppointment> = { 
      where: { patientId },
      raw: true,
      order: [['createdAt', 'DESC']] // Most recent first
    };
    return this.appointmentDataSource.fetchAll(query);
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: IAppointment["status"]
  ): Promise<void> {
    await this.appointmentDataSource.updateOne(
      { where: { id: appointmentId } },
      { status }
    );
  }

  async deleteAppointment(appointmentId: string): Promise<void> {
    await this.appointmentDataSource.deleteOne({
      where: { id: appointmentId },
    });
  }
}

export default AppointmentService;
