import ConsultationDataSource from "../datasources/consultation.datasource";
import { IConsultation, IConsultationCreationBody, IFindConsultationQuery } from "../interfaces/consultation.interface";


class ConsultationService {
  private consultationDatasource: ConsultationDataSource;

  constructor() {
    this.consultationDatasource = new ConsultationDataSource();
  }

  async createConsultation(data: IConsultationCreationBody): Promise<IConsultation> {
    return await this.consultationDatasource.create(data);
  }

  async getConsultationById(
    appointmentId: string
  ): Promise<IConsultation | null> {
    return await this.consultationDatasource.fetchOne({
      where: { id: appointmentId },
    });
  }

  async updateConsultation(
    id: string,
    data: Partial<IConsultation>
  ): Promise<void> {
    const filter = { where: { id } } as IFindConsultationQuery;
    await this.consultationDatasource.updateOne(data, filter);
  }

  async getConsultations(): Promise<IConsultation[]> {
    const query = { where: {}, raw: true };
    return this.consultationDatasource.fetchAll(query);
  }

  async getConsultationsByDoctorId(doctorId: string): Promise<IConsultation[]> {
    // First get appointments by doctor ID, then get consultations for those appointments
    const { appointmentService } = await import("../services/index");
    const appointments = await appointmentService.getAppointmentsByDoctorId(doctorId);
    
    const consultationPromises = appointments.map(appointment => 
      this.getConsultationById(appointment.id)
    );
    
    const consultations = await Promise.all(consultationPromises);
    return consultations.filter(consultation => consultation !== null) as IConsultation[];
  }

  async deleteConsultation(postId: string): Promise<void> {
    await this.consultationDatasource.deleteOne({ where: { id: postId } });
  }
}

export default ConsultationService;
