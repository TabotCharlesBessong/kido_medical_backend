import { FindOptions } from "sequelize";
import {
  IFindAppointmentQuery,
  IAppointment,
  IAppointmentCreationBody,
  IAppointmentDataSource,
} from "../interfaces/appointment.interface";
import AppointmentModel from "../models/appointment.model";

class AppointmentDataSource implements IAppointmentDataSource {
  async create(record: IAppointmentCreationBody): Promise<IAppointment> {
    return await AppointmentModel.create(record);
  }

  async fetchOne(query: IFindAppointmentQuery): Promise<IAppointment | null> {
    return await AppointmentModel.findOne(query);
  }

  async updateOne(
    searchBy: IFindAppointmentQuery,
    data: Partial<IAppointment>
  ): Promise<void> {
    await AppointmentModel.update(data, { ...searchBy, returning: true });
  }

  async fetchAll(query: FindOptions<IAppointment>): Promise<IAppointment[]> {
    return await AppointmentModel.findAll(query);
  }

  async deleteOne(searchBy: IFindAppointmentQuery): Promise<void> {
    await AppointmentModel.destroy(searchBy);
  }
}

export default AppointmentDataSource;
