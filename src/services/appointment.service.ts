import AppointmentDataSource from "../datasources/appointment.datasource";
import {
  IAppointmentCreationBody,
  IAppointment,
  IAppointmentDataSource,
} from "../interfaces/appointment.interface";

class AppointmentService {
  private appointmentDataSource: IAppointmentDataSource;

  constructor(_appointmentDataSource:IAppointmentDataSource) {
    this.appointmentDataSource = _appointmentDataSource
  }

  async createAppointment(
    data: IAppointmentCreationBody
  ): Promise<IAppointment> {
    return await this.appointmentDataSource.create(data);
  }

  async getAppointmentById(
    appointmentId: string
  ): Promise<IAppointment | null> {
    return await this.appointmentDataSource.fetchOne({
      where: { id: appointmentId },
    });
  }

  async updateAppointment(
    appointmentId: string,
    data: Partial<IAppointment>
  ): Promise<void> {
    await this.appointmentDataSource.updateOne(
      { where: { id: appointmentId } },
      data
    );
  }

  async getAppointments(): Promise<IAppointment[]> {
    const query = { where: {}, raw: true };
    return this.appointmentDataSource.fetchAll(query);
  }
}

export default AppointmentService;
