import TimeSlotDataSource from "../datasources/timeslot.datasource";
import TimeslotDatasource from "../datasources/timeslot.datasource";
import { ITimeSlotCreationBody, ITimeSlot, ITimeSlotDataSource } from "../interfaces/timeslot.interface";
import { FindOptions } from "sequelize";

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

  async getTimeSlotsByDoctor(doctorId: string): Promise<ITimeSlot[]> {
    const query: FindOptions<ITimeSlot> = { 
      where: { doctorId },
      raw: true,
      order: [['startTime', 'ASC']] // Order by start time
    };
    return this.timeSlotDatasource.fetchAll(query);
  }
}

export default TimeSlotService