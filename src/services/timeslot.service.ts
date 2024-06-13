import TimeslotDatasource from "../datasources/timeslot.datasource";
import { ITimeSlotCreationBody, ITimeSlot, ITimeSlotDataSource } from "../interfaces/timeslot.interface";

class TimeSlotService {
  private timeSlotDatasource: ITimeSlotDataSource;
  constructor(_timeSlotDatasource: ITimeSlotDataSource) {
    this.timeSlotDatasource = _timeSlotDatasource;
  }

  async createTimeSlot(record: ITimeSlotCreationBody): Promise<ITimeSlot> {
    return this.timeSlotDatasource.create(record);
  }

  async getTimeSlots(): Promise<ITimeSlot[]> {
    const query = { where: {}, raw: true };
    return this.timeSlotDatasource.fetchAll(query);
  }
}

export default TimeSlotService