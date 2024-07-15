import { FindOptions } from "sequelize";
import { IDoctor, IDoctorCreationBody, IDoctorDataSource, IFindDoctorQuery } from "../interfaces/doctor.interface";
import DoctorModel from "../models/doctor.model";
import UserModel from "../models/user.model";


class DoctorDataSource implements IDoctorDataSource {
  async create(record: IDoctorCreationBody): Promise<IDoctor> {
    return await DoctorModel.create(record);
  }

  async fetchOne(query: IFindDoctorQuery): Promise<IDoctor | null> {
    return await DoctorModel.findOne({
      ...query,
      include: [
        {
          model: UserModel,
          as: "users",
          attributes: [
            "username",
            "firstname",
            "lastname",
            "email",
            "accountStatus",
            "role",
          ],
        },
      ],
    });
  }

  async updateOne(
    searchBy: IFindDoctorQuery,
    data: Partial<IDoctor>
  ): Promise<void> {
    await DoctorModel.update(data, searchBy);
  }

  async fetchAll(query: FindOptions<IDoctor>): Promise<IDoctor[]> {
    return await DoctorModel.findAll({
      ...query,
      include: [
        {
          model: UserModel,
          as: "users",
          attributes: [
            "username",
            "firstname",
            "lastname",
            "email",
            "accountStatus",
            "role",
          ],
        },
      ],
    });
  }
}

export default DoctorDataSource;
