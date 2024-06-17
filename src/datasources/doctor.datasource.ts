import { FindOptions } from "sequelize";
import { IDoctor, IDoctorCreationBody, IDoctorDataSource, IFindDoctorQuery } from "../interfaces/doctor.interface";
import DoctorModel from "../models/doctor.model";


class DoctorDataSource implements IDoctorDataSource {
  async create(record: IDoctorCreationBody): Promise<IDoctor> {
    return await DoctorModel.create(record);
  }

  async fetchOne(query: IFindDoctorQuery): Promise<IDoctor | null> {
    return await DoctorModel.findOne(query);
  }

  async updateOne(
    searchBy: IFindDoctorQuery,
    data: Partial<IDoctor>
  ): Promise<void> {
    await DoctorModel.update(data, searchBy);
  }

  async fetchAll(query: FindOptions<IDoctor>): Promise<IDoctor[]> {
    return await DoctorModel.findAll(query);
  }
}

export default DoctorDataSource;
