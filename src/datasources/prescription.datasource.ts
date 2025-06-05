import { FindOptions, Transaction } from "sequelize";
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
    return await PrescriptionModel.create(record as any, {
      returning: true,
      ...options,
    });
  }

  async fetchOne(query: IFindPrescriptionQuery): Promise<IPrescription | null> {
    return await PrescriptionModel.findOne({
      ...query,
      include: [{
        association: 'medications',
        required: false
      }]
    });
  }

  async fetchById(PrescriptionId: string): Promise<IPrescription | null> {
    return await PrescriptionModel.findOne({
      where: { id: PrescriptionId },
      include: [{
        association: 'medications',
        required: false
      }]
    });
  }

  async updateOne(
    data: Partial<IPrescription>,
    query: IFindPrescriptionQuery
  ): Promise<void> {
    await PrescriptionModel.update(data as any, { ...query, returning: true });
  }

  async deleteOne(searchBy: IFindPrescriptionQuery): Promise<void> {
    await PrescriptionModel.destroy(searchBy);
  }

  async fetchAll(query: FindOptions<IPrescription>): Promise<IPrescription[]> {
    return await PrescriptionModel.findAll({
      ...query,
      include: [{
        association: 'medications',
        required: false
      }]
    });
  }

  // Optimized method to fetch prescriptions with pagination
  async fetchPaginated(
    page: number = 1,
    limit: number = 10,
    where: Record<string, any> = {},
    transaction?: Transaction
  ): Promise<{ prescriptions: IPrescription[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const [prescriptions, total] = await Promise.all([
      PrescriptionModel.findAll({
        where,
        limit,
        offset,
        include: [{
          association: 'medications',
          required: false
        }],
        transaction
      }),
      PrescriptionModel.count({ where, transaction })
    ]);

    return { prescriptions, total };
  }

  // Optimized method to fetch prescriptions by consultation with caching
  async fetchByConsultation(
    consultationId: string,
    transaction?: Transaction
  ): Promise<IPrescription[]> {
    return await PrescriptionModel.findAll({
      where: { consultationId },
      include: [{
        association: 'medications',
        required: false
      }],
      transaction
    });
  }
}

export default PrescriptionDataSource;
