import { IPrescription, IPrescriptionCreationBody } from "../interfaces/prescription.interface";
import { IMedicationCreationBody } from "../interfaces/medication.interface";
import PrescriptionDataSource from "../datasources/prescription.datasource";
import MedicationDataSource from "../datasources/medication.datasource";

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
    if (!prescriptionData.consultationId) {
      throw new Error("consultationId is required");
    }

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      throw new Error("medications array is required and must not be empty");
    }

    // Create prescription
    const prescription = await this.prescriptionDataSource.create({
      consultationId: prescriptionData.consultationId,
      instructions: prescriptionData.instructions,
      investigation: prescriptionData.investigation
    });

    // Create medications
    for (const medication of medications) {
      await this.medicationDataSource.create({
        ...medication,
        prescriptionId: prescription.id
      });
    }

    // Return prescription with medications
    const createdPrescription = await this.getPrescriptionById(prescription.id);
    if (!createdPrescription) {
      throw new Error("Failed to create prescription");
    }
    return createdPrescription;
  }

  async getPrescriptionById(id: string): Promise<IPrescription | null> {
    return await this.prescriptionDataSource.fetchById(id);
  }

  async updatePrescription(
    id: string,
    prescriptionData: Partial<IPrescription>,
    medications: IMedicationCreationBody[]
  ): Promise<void> {
    // Update prescription
    await this.prescriptionDataSource.updateOne(prescriptionData, {
      where: { id }
    });

    // Delete existing medications
    await this.medicationDataSource.deleteMany({
      where: { prescriptionId: id }
    });

    // Create new medications
    for (const medication of medications) {
      await this.medicationDataSource.create({
        ...medication,
        prescriptionId: id
      });
    }
  }

  async getPrescriptions(): Promise<IPrescription[]> {
    return await this.prescriptionDataSource.fetchAll({
      include: [{
        association: 'medications',
        required: false
      }]
    });
  }

  async deletePrescription(id: string): Promise<void> {
    // Delete medications first
    await this.medicationDataSource.deleteMany({
      where: { prescriptionId: id }
    });
    // Then delete prescription
    await this.prescriptionDataSource.deleteOne({ where: { id } });
  }
}

export default PrescriptionService;