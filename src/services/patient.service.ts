import { IPatientDataSource } from './../interfaces/patient.interface';
import PatientDataSource from "../datasources/patient.datasource";
import {
  IPatientCreationBody,
  IPatient,
} from "../interfaces/patient.interface";

class PatientService {
  private patientDataSource: PatientDataSource;

  constructor() {
    this.patientDataSource = new PatientDataSource()
  }

  async createPatient(data: IPatientCreationBody): Promise<IPatient> {
    return await this.patientDataSource.create(data);
  }

  async getPatientById(userId: string): Promise<IPatient | null> {
    return await this.patientDataSource.fetchOne({ where: { userId } });
  }

  async updatePatient(patientId: string, updateData: Partial<IPatient>): Promise<IPatient | null> {
    const filter = { where: { id: patientId } };
    await this.patientDataSource.updateOne(filter, updateData);
    return this.getPatientById(patientId);
  }
}

export default PatientService;
