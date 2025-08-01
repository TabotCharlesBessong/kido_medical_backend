import { IPatientDataSource } from './../interfaces/patient.interface';
import PatientDataSource from "../datasources/patient.datasource";
import {
  IPatientCreationBody,
  IPatient,
} from "../interfaces/patient.interface";
import { FindOptions } from "sequelize";

class PatientService {
  private patientDataSource: PatientDataSource;

  constructor(patientDataSource: PatientDataSource) {
    this.patientDataSource = patientDataSource;
  }

  async createPatient(data: IPatientCreationBody): Promise<IPatient> {
    return await this.patientDataSource.create(data);
  }

  async getPatientById(userId: string): Promise<IPatient | null> {
    return await this.patientDataSource.fetchOne({ where: { userId } });
  }

  async updatePatient(userId: string, data: Partial<IPatient>): Promise<IPatient | null> {
    await this.patientDataSource.updateOne(
      { where: { userId } },
      data
    );
    return await this.getPatientById(userId);
  }

  async getAllPatients(): Promise<IPatient[]> {
    return await this.patientDataSource.fetchAll({ where: {} });
  }

  async deletePatient(id: string): Promise<void> {
    await this.patientDataSource.deleteOne({ where: { id } });
  }
}

export default PatientService;
