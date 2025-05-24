import TimeSlotDataSource from "../datasources/timeslot.datasource";
import TimeslotDatasource from "../datasources/timeslot.datasource";
import { ITimeSlotCreationBody, ITimeSlot, ITimeSlotDataSource } from "../interfaces/timeslot.interface";

class TimeSlotService {
  private timeSlotDatasource: TimeSlotDataSource;
  constructor() {
    this.timeSlotDatasource = new TimeSlotDataSource();
  }

  async createTimeSlot(record: ITimeSlotCreationBody): Promise<ITimeSlot> {
    return this.timeSlotDatasource.create(record);
  }

  async getTimeSlots(query?: any): Promise<ITimeSlot[]> {
    return this.timeSlotDatasource.fetchAll(query || { where: {}, raw: true });
  }
}

export default TimeSlotService