import { IDoctor, IDoctorCreationBody, IDoctorDataSource } from "../interfaces/doctor.interface";
import UserService from "./user.services";

class DoctorService {
  private doctorDatasource: IDoctorDataSource;

  constructor(_doctorDatasource: IDoctorDataSource) {
    this.doctorDatasource = _doctorDatasource;
  }

  async createDoctor(record: IDoctorCreationBody): Promise<IDoctor> {
    return this.doctorDatasource.create(record);
  }

  async getDoctorByUserId(userId: string): Promise<IDoctor | null> {
    const query = { where: { userId }, raw: true, returning: true };
    return this.doctorDatasource.fetchOne(query)
  }
}

export default DoctorService