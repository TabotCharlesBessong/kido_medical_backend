import TimeSlotDataSource from "../datasources/timeslot.datasource";
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

  async getTimeSlotById(id: string): Promise<ITimeSlot | null> {
    return await this.timeSlotDatasource.fetchOne({
      where: { id },
      returning: true
    });
  }

  async updateTimeSlot(
    id: string,
    data: Partial<ITimeSlot>
  ): Promise<ITimeSlot | null> {
    await this.timeSlotDatasource.updateOne(
      { where: { id }, returning: true },
      data
    );
    return await this.getTimeSlotById(id);
  }
}

export default TimeSlotService;