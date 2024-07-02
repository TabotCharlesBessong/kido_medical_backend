import { FindOptions } from "sequelize";
import {
  IFindPrescriptionQuery,
  IPrescription,
  IPrescriptionCreationBody,
  IPrescriptionDataSource,
} from "../interfaces/prescription.interface";
import PrescriptionModel from "../models/prescription.model";

class PrescriptionDataSource implements IPrescriptionDataSource {
  async create(
    record: IPrescriptionCreationBody,
    options?: Partial<IFindPrescriptionQuery>
  ): Promise<IPrescription> {
    return await PrescriptionModel.create(record, {
      returning: true,
      ...options,
    });
  }

  async fetchOne(query: IFindPrescriptionQuery): Promise<IPrescription | null> {
    return await PrescriptionModel.findOne(query);
  }

  async fetchById(PrescriptionId: string): Promise<IPrescription | null> {
    return await PrescriptionModel.findOne({
      where: { id: PrescriptionId },
    });
  }

  async updateOne(
    data: Partial<IPrescription>,
    query: IFindPrescriptionQuery
  ): Promise<void> {
    await PrescriptionModel.update(data, { ...query, returning: true });
  }

  async deleteOne(searchBy: IFindPrescriptionQuery): Promise<void> {
    await PrescriptionModel.destroy(searchBy);
  }

  async fetchAll(query: FindOptions<IPrescription>): Promise<IPrescription[]> {
    return await PrescriptionModel.findAll(query);
  }
}

export default PrescriptionDataSource;
