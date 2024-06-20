import { FindOptions } from "sequelize";
import {
  IFindAppointmentQuery,
  IAppointment,
  IAppointmentCreationBody,
  IAppointmentDataSource,
} from "../interfaces/appointment.interface";
import AppointmentModel from "../models/appointment.model";

class AppointmentDataSource implements IAppointmentDataSource {
  async create(
    record: IAppointmentCreationBody,
    options?: Partial<IFindAppointmentQuery>
  ): Promise<IAppointment> {
    return await AppointmentModel.create(record, {
      returning: true,
      ...options,
    });
  }

  async fetchOne(query: IFindAppointmentQuery): Promise<IAppointment | null> {
    return await AppointmentModel.findOne(query);
  }

  async fetchById(appointmentId: string): Promise<IAppointment | null> {
    return await AppointmentModel.findOne({
      where: { id: appointmentId },
    });
  }

  async updateOne(
    data: Partial<IAppointment>,
    query: IFindAppointmentQuery
  ): Promise<void> {
    await AppointmentModel.update(data, query);
  }

  async fetchAll(query: FindOptions<IAppointment>): Promise<IAppointment[]> {
    return await AppointmentModel.findAll(query);
  }
}

export default AppointmentDataSource;
