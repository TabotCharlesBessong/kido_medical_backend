import DoctorDataSource from "../datasources/doctor.datasource";
import { IDoctor, IDoctorCreationBody, IDoctorDataSource, IFindDoctorQuery } from "../interfaces/doctor.interface";
import UserService from "./user.services";

class DoctorService {
  private doctorDatasource: DoctorDataSource;

  constructor() {
    this.doctorDatasource = new DoctorDataSource()
  }

  async createDoctor(record: IDoctorCreationBody): Promise<IDoctor> {
    return this.doctorDatasource.create(record);
  }

  async getDoctorByUserId(id: string): Promise<IDoctor | null> {
    const query = { where: { userId: id }, raw: true, returning: true };
    return this.doctorDatasource.fetchOne(query);
  }

  async getDoctorByField(record: Partial<IDoctor>) {
    const query = {
      where: { ...record },
      raw: true,
    } as IFindDoctorQuery;
    return this.doctorDatasource.fetchOne(query);
  }

  async getDoctors(): Promise<IDoctor[]> {
    const query = { where: {}, raw: true };
    return this.doctorDatasource.fetchAll(query);
  }

  async updateDoctorVerification(
    doctorId: string,
    updateData: {
      isVerified: boolean;
      verificationNotes?: string;
      verifiedAt?: Date | null;
    }
  ): Promise<IDoctor | null> {
    const filter = { where: { id: doctorId } };
    await this.doctorDatasource.updateOne(filter, {
      isVerified: updateData.isVerified,
      verificationNotes: updateData.verificationNotes,
      verifiedAt: updateData.verifiedAt
    });
    return this.getDoctorByField({ where: { id: doctorId } });
  }

  async updateDoctor(doctorId: string, updateData: Partial<IDoctor>): Promise<IDoctor | null> {
    const filter = { where: { id: doctorId } };
    await this.doctorDatasource.updateOne(filter, updateData);
    return this.getDoctorByField({ where: { id: doctorId } });
  }
}

export default DoctorService