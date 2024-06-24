import { FindOptions } from "sequelize";
import {
  IFindVitalSignQuery,
  IVitalSign,
  IVitalSignCreationBody,
  IVitalSignDataSource,
} from "../interfaces/vitalsign.interface";
import VitalSignModel from "../models/vitalsign.model";

class VitalSignDataSource implements IVitalSignDataSource {
  async create(
    record: IVitalSignCreationBody,
    options?: Partial<IFindVitalSignQuery>
  ): Promise<IVitalSign> {
    return await VitalSignModel.create(record, {
      returning: true,
      ...options,
    });
  }

  async fetchOne(query: IFindVitalSignQuery): Promise<IVitalSign | null> {
    return await VitalSignModel.findOne(query);
  }

  async fetchById(VitalSignId: string): Promise<IVitalSign | null> {
    return await VitalSignModel.findOne({
      where: { id: VitalSignId },
    });
  }

  async updateOne(
    data: Partial<IVitalSign>,
    query: IFindVitalSignQuery
  ): Promise<void> {
    await VitalSignModel.update(data, { ...query, returning: true });
  }

  async fetchAll(query: FindOptions<IVitalSign>): Promise<IVitalSign[]> {
    return await VitalSignModel.findAll(query);
  }

  async deleteOne(searchBy: IFindVitalSignQuery): Promise<void> {
    await VitalSignModel.destroy(searchBy);
  }
}

export default VitalSignDataSource;
