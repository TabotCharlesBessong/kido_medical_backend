import MedicationDataSource from "../datasources/medication.datasource";
import PrescriptionDataSource from "../datasources/prescription.datasource";
import { IMedicationCreationBody } from "../interfaces/medication.interface";
import { IFindPrescriptionQuery, IPrescription } from "../interfaces/prescription.interface";

class PrescriptionService {
  private prescriptionDataSource: PrescriptionDataSource;
  private medicationDataSource: MedicationDataSource;

  constructor() {
    this.prescriptionDataSource = new PrescriptionDataSource();
    this.medicationDataSource = new MedicationDataSource();
  }

  async createPrescription(
    prescriptionData: Partial<IPrescription>,
    medications: IMedicationCreationBody[]
  ): Promise<IPrescription> {
    const prescription = await this.prescriptionDataSource.create(
      prescriptionData
    );

    for (const medication of medications) {
      medication.prescriptionId = prescription.id;
      await this.medicationDataSource.create(medication);
    }

    return prescription;
  }

  async getPrescriptionById(
    prescriptionId: string
  ): Promise<IPrescription | null> {
    return await this.prescriptionDataSource.fetchOne({
      where: { id: prescriptionId },
    });
  }

  async updatePrescription(
    id: string,
    data: Partial<IPrescription>,
    medications: IMedicationCreationBody[]
  ): Promise<void> {
    const filter = { where: { id } } as IFindPrescriptionQuery;
    await this.prescriptionDataSource.updateOne(data, filter);

    for (const medication of medications) {
      medication.prescriptionId = id;
      await this.medicationDataSource.create(medication);
    }
  }

  async getPrescriptions(): Promise<IPrescription[]> {
    const query = { where: {}, raw: true };
    return this.prescriptionDataSource.fetchAll(query);
  }

  async deletePrescription(postId: string): Promise<void> {
    await this.prescriptionDataSource.deleteOne({ where: { id: postId } });
  }
}

export default PrescriptionService