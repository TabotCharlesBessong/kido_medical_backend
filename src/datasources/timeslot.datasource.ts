import { FindOptions } from "sequelize";
import {
  ITimeSlotDataSource,
  ITimeSlotCreationBody,
  ITimeSlot,
  IFindTimeSlotQuery,
} from "../interfaces/timeslot.interface";
import TimeSlotModel from "../models/timeslot.model";

class TimeSlotDataSource implements ITimeSlotDataSource {
  async create(record: ITimeSlotCreationBody): Promise<ITimeSlot> {
    return await TimeSlotModel.create(record);
  }

  async fetchOne(query: IFindTimeSlotQuery): Promise<ITimeSlot | null> {
    return await TimeSlotModel.findOne(query);
  }

  async updateOne(
    searchBy: IFindTimeSlotQuery,
    data: Partial<ITimeSlot>
  ): Promise<void> {
    await TimeSlotModel.update(data, searchBy);
  }

  async fetchAll(query: FindOptions<ITimeSlot>): Promise<ITimeSlot[]> {
    return await TimeSlotModel.findAll(query);
  }
}

export default new TimeSlotDataSource();
