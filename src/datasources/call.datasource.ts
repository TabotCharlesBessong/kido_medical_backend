import { FindOptions } from "sequelize";
import {
  IFindCallQuery,
  ICall,
  ICallCreationBody,
  ICallDataSource,
} from "../interfaces/call.interface";
import CallModel from "../models/call.model";

class CallDataSource implements ICallDataSource {
  async create(record: ICallCreationBody): Promise<ICall> {
    return await CallModel.create(record);
  }

  async fetchOne(query: IFindCallQuery): Promise<ICall | null> {
    return await CallModel.findOne(query);
  }

  async updateOne(
    searchBy: IFindCallQuery,
    data: Partial<ICall>
  ): Promise<void> {
    await CallModel.update(data, { ...searchBy, returning: true });
  }

  async fetchAll(query: FindOptions<ICall>): Promise<ICall[]> {
    return await CallModel.findAll(query);
  }
}

export default CallDataSource;
