import { FindOptions } from "sequelize";
import {
  IFindMedicationQuery,
  IMedication,
  IMedicationCreationBody,
  IMedicationDataSource,
} from "../interfaces/medication.interface";
import MedicationModel from "../models/medication.model";

class MedicationDataSource implements IMedicationDataSource {
  async create(
    record: IMedicationCreationBody,
    options?: Partial<IFindMedicationQuery>
  ): Promise<IMedication> {
    return await MedicationModel.create(record, {
      returning: true,
      ...options,
    });
  }

  async fetchOne(query: IFindMedicationQuery): Promise<IMedication | null> {
    return await MedicationModel.findOne(query);
  }

  async fetchById(MedicationId: string): Promise<IMedication | null> {
    return await MedicationModel.findOne({
      where: { id: MedicationId },
    });
  }

  async updateOne(
    data: Partial<IMedication>,
    query: IFindMedicationQuery
  ): Promise<void> {
    await MedicationModel.update(data, { ...query, returning: true });
  }

  async fetchAll(query: FindOptions<IMedication>): Promise<IMedication[]> {
    return await MedicationModel.findAll(query);
  }
}

export default MedicationDataSource;
