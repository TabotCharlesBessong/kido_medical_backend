import { IDoctor, IDoctorCreationBody, IDoctorDataSource } from "../interfaces/doctor.interface";
import UserService from "./user.services";

class DoctorService {
  private doctorDatasource: IDoctorDataSource

  constructor(_doctorDatasource:IDoctorDataSource){
    this.doctorDatasource = _doctorDatasource
  }

  async createDoctor(record:IDoctorCreationBody):Promise<IDoctor>{
    return this.doctorDatasource.create(record)
  }
}

export default DoctorService