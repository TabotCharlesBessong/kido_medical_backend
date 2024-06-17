import {
  IFindPatientQuery,
  IPatient,
  IPatientCreationBody,
  IPatientDataSource,
} from "../interfaces/patient.interface";
import PatientModel from "../models/patient.model";

class PatientDataSource implements IPatientDataSource {
  async create(record: IPatientCreationBody): Promise<IPatient> {
    return await PatientModel.create(record);
  }

  async fetchOne(query: IFindPatientQuery): Promise<IPatient | null> {
    return await PatientModel.findOne(query);
  }

  async updateOne(
    searchBy: IFindPatientQuery,
    data: Partial<IPatient>
  ): Promise<void> {
    await PatientModel.update(data, searchBy);
  }
}

export default PatientDataSource;
