import { FindOptions } from "sequelize";
import {
  IFindConsultationQuery,
  IConsultation,
  IConsultationCreationBody,
  IConsultationDataSource,
} from "../interfaces/consultation.interface";
import ConsultationModel from "../models/consultation.model";

class ConsultationDataSource implements IConsultationDataSource {
  async create(
    record: IConsultationCreationBody,
    options?: Partial<IFindConsultationQuery>
  ): Promise<IConsultation> {
    return await ConsultationModel.create(record, {
      returning: true,
      ...options,
    });
  }

  async fetchOne(query: IFindConsultationQuery): Promise<IConsultation | null> {
    return await ConsultationModel.findOne(query);
  }

  async fetchById(ConsultationId: string): Promise<IConsultation | null> {
    return await ConsultationModel.findOne({
      where: { id: ConsultationId },
    });
  }

  async updateOne(
    data: Partial<IConsultation>,
    query: IFindConsultationQuery
  ): Promise<void> {
    await ConsultationModel.update(data, { ...query, returning: true });
  }

  async fetchAll(query: FindOptions<IConsultation>): Promise<IConsultation[]> {
    return await ConsultationModel.findAll(query);
  }
}

export default ConsultationDataSource;
