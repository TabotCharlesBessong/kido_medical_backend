import AppointmentDataSource from "../datasources/appointment.datasource";
import NotificationDataSource from "../datasources/notification.datasource";
import {
  IAppointmentCreationBody,
  IAppointment,
  IAppointmentDataSource,
  IFindAppointmentQuery,
} from "../interfaces/appointment.interface";
import { NotificationType } from "../interfaces/enum/notification.enum";
import { AppointmentStatus } from "../interfaces/enum/patient.enum";
import { INotificationDataSource } from "../interfaces/notification.interface";

class AppointmentService {
  private appointmentDataSource: AppointmentDataSource;
  private notificationDataSource: NotificationDataSource;

  constructor(
  ) {
    this.appointmentDataSource = new AppointmentDataSource();
    this.notificationDataSource = new NotificationDataSource();
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

    // Notify the doctor
    await this.notificationDataSource.create({
      userId: createdAppointment.patientId,
      appointmentId: createdAppointment.id,
      message: "Your appointment has been created",
      type: NotificationType.APPOINTMENT_SCHEDULED,
      read: false,
    });

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
      await this.notificationDataSource.create({
        userId: appointment.patientId,
        appointmentId: appointment.id,
        message: "Your appointment has been approved",
        type: NotificationType.APPOINTMENT_APPROVED,
      });
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
      await this.notificationDataSource.create({
        userId: appointment.patientId,
        appointmentId: appointment.id,
        message: "Your appointment has been canceled",
        type: NotificationType.APPOINTMENT_CANCELLED,
      });
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
}

export default AppointmentService;
