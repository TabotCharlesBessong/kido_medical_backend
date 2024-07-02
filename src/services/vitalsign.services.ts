import VitalSignDataSource from "../datasources/vitalsign.datasource";
import { IFindVitalSignQuery, IVitalSign, IVitalSignCreationBody } from "../interfaces/vitalsign.interface";

class VitalSignService {
  private vitalsignDataSource: VitalSignDataSource;

  constructor() {
    this.vitalsignDataSource = new VitalSignDataSource();
  }

  async recordVitalSigns(record: IVitalSignCreationBody): Promise<IVitalSign> {
    return this.vitalsignDataSource.create(record);
  }

  async getVitalSignsById(appointmentId: string): Promise<IVitalSign | null> {
    return await this.vitalsignDataSource.fetchOne({
      where: { id: appointmentId },
    });
  }

  async updateVitalSigns(
    id: string,
    data: Partial<IVitalSign>
  ): Promise<void> {
    const filter = { where: { id } } as IFindVitalSignQuery;
    await this.vitalsignDataSource.updateOne(data, filter);
  }

  async getVitalSigns(): Promise<IVitalSign[]> {
    const query = { where: {}, raw: true };
    return this.vitalsignDataSource.fetchAll(query);
  }

  async deleteVitalSigns(vitalId: string): Promise<void> {
    await this.vitalsignDataSource.deleteOne({ where: { id: vitalId } });
  }
}

export default VitalSignService