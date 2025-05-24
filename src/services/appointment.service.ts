import AppointmentDataSource from "../datasources/appointment.datasource";
import NotificationDataSource from "../datasources/notification.datasource";
import DoctorService from "./doctor.service";
import PatientService from "./patient.service";
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

class AppointmentService {
  private appointmentDataSource: AppointmentDataSource;
  private notificationDataSource: NotificationDataSource;
  private doctorService: DoctorService;
  private patientService: PatientService;

  constructor() {
    this.appointmentDataSource = new AppointmentDataSource();
    this.notificationDataSource = new NotificationDataSource();
    this.doctorService = new DoctorService();
    this.patientService = new PatientService();
  }

  async createAppointment(
    record: Partial<IAppointment>
  ): Promise<IAppointment> {
    const appointment = {
      ...record,
      status: AppointmentStatus.PENDING,
    } as IAppointmentCreationBody;
    const createdAppointment = await this.appointmentDataSource.create(
      appointment
    );

    // Get doctor and patient records to get their user IDs
    const doctor = await this.doctorService.getDoctorByField({ id: createdAppointment.doctorId });
    const patient = await this.patientService.getPatientById(createdAppointment.patientId);

    if (doctor && patient) {
      // Notify the doctor
      await this.notificationDataSource.create({
        userId: doctor.userId, // Use the doctor's user ID
        message: "New appointment request received",
        type: NotificationType.APPOINTMENT,
        referenceId: createdAppointment.id,
        read: false,
      });

      // Notify the patient
      await this.notificationDataSource.create({
        userId: patient.userId, // Use the patient's user ID
        message: "Your appointment request has been sent",
        type: NotificationType.APPOINTMENT,
        referenceId: createdAppointment.id,
        read: false,
      });
    }

    return createdAppointment;
  }

  async approveAppointment(appointmentId: string): Promise<void> {
    const filter = { where: { id: appointmentId } };
    const update = {
      status: AppointmentStatus.APPROVED,
    } as Partial<IAppointment>;
    await this.appointmentDataSource.updateOne(update, filter);

    const appointment = await this.getAppointmentById(appointmentId);
    if (appointment) {
      const patient = await this.patientService.getPatientById(appointment.patientId);
      if (patient) {
        await this.notificationDataSource.create({
          userId: patient.userId, // Use the patient's user ID
          message: "Your appointment has been approved",
          type: NotificationType.APPOINTMENT,
          referenceId: appointment.id,
          read: false,
        });
      }
    }
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    const filter = { where: { id: appointmentId } };
    const update = {
      status: AppointmentStatus.CANCELED,
    } as Partial<IAppointment>;
    await this.appointmentDataSource.updateOne(update, filter);

    const appointment = await this.getAppointmentById(appointmentId);
    if (appointment) {
      const patient = await this.patientService.getPatientById(appointment.patientId);
      if (patient) {
        await this.notificationDataSource.create({
          userId: patient.userId, // Use the patient's user ID
          message: "Your appointment has been canceled",
          type: NotificationType.APPOINTMENT,
          referenceId: appointment.id,
          read: false,
        });
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
}

export default AppointmentService;
