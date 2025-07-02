import { FindOptions } from "sequelize";
import {
  IReminder,
  IReminderCreationBody,
  IReminderDataSource,
  IFindReminderQuery,
} from "../interfaces/reminder.interface";
import ReminderModel from "../models/reminder.model";

class ReminderDataSource implements IReminderDataSource {
  async create(record: IReminderCreationBody): Promise<IReminder> {
    return await ReminderModel.create(record);
  }

  async fetchOne(query: IFindReminderQuery): Promise<IReminder | null> {
    return await ReminderModel.findOne(query);
  }

  async updateOne(
    searchBy: IFindReminderQuery,
    data: Partial<IReminder>
  ): Promise<void> {
    await ReminderModel.update(data, searchBy);
  }

  async fetchAll(query: FindOptions<IReminder>): Promise<IReminder[]> {
    return await ReminderModel.findAll(query);
  }

  async deleteOne(searchBy: IFindReminderQuery): Promise<void> {
    await ReminderModel.destroy(searchBy);
  }
}

export default ReminderDataSource;