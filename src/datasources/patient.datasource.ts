import { FindOptions } from "sequelize";
import {
  IFindPatientQuery,
  IPatient,
  IPatientCreationBody,
  IPatientDataSource,
} from "../interfaces/patient.interface";
import PatientModel from "../models/patient.model";
import UserModel from "../models/user.model";

class PatientDataSource implements IPatientDataSource {
  async create(record: IPatientCreationBody): Promise<IPatient> {
    return await PatientModel.create(record);
  }

  async fetchOne(query: IFindPatientQuery): Promise<IPatient | null> {
    return await PatientModel.findOne({
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
    searchBy: IFindPatientQuery,
    data: Partial<IPatient>
  ): Promise<void> {
    await PatientModel.update(data, searchBy);
  }

  async fetchAll(query: FindOptions<IPatient>): Promise<IPatient[]> {
    return await PatientModel.findAll({
      ...query,
      include: [
        {
          model: UserModel,
          as: "user",
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

export default PatientDataSource;
