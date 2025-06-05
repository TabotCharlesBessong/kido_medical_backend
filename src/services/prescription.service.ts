import { IPrescription, IPrescriptionCreationBody } from "../interfaces/prescription.interface";
import { IMedicationCreationBody } from "../interfaces/medication.interface";
import PrescriptionDataSource from "../datasources/prescription.datasource";
import MedicationDataSource from "../datasources/medication.datasource";
import sequelize from "../database";

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

    const transaction = await sequelize.transaction();

    try {
      // Create prescription
      const prescription = await this.prescriptionDataSource.create({
        consultationId: prescriptionData.consultationId,
        instructions: prescriptionData.instructions,
        investigation: prescriptionData.investigation
      }, { transaction });

      // Create medications in bulk
      const medicationsWithPrescriptionId = medications.map(medication => ({
        ...medication,
        prescriptionId: prescription.id
      }));

      await this.medicationDataSource.bulkCreate(medicationsWithPrescriptionId, { transaction });

      await transaction.commit();

      // Return prescription with medications
      const createdPrescription = await this.getPrescriptionById(prescription.id);
      if (!createdPrescription) {
        throw new Error("Failed to create prescription");
      }
      return createdPrescription;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getPrescriptionById(id: string): Promise<IPrescription | null> {
    return await this.prescriptionDataSource.fetchById(id, {
      include: [{
        association: 'medications',
        required: false
      }]
    });
  }

  async updatePrescription(
    id: string,
    prescriptionData: Partial<IPrescription>,
    medications: IMedicationCreationBody[]
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      // Update prescription
      await this.prescriptionDataSource.updateOne(prescriptionData, {
        where: { id },
        transaction
      });

      // Delete existing medications
      await this.medicationDataSource.deleteMany({
        where: { prescriptionId: id },
        transaction
      });

      // Create new medications in bulk
      const medicationsWithPrescriptionId = medications.map(medication => ({
        ...medication,
        prescriptionId: id
      }));

      await this.medicationDataSource.bulkCreate(medicationsWithPrescriptionId, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
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
    const transaction = await sequelize.transaction();

    try {
      // Delete medications first
      await this.medicationDataSource.deleteMany({
        where: { prescriptionId: id },
        transaction
      });

      // Then delete prescription
      await this.prescriptionDataSource.deleteOne({ 
        where: { id },
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default PrescriptionService;