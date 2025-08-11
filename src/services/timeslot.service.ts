import TimeSlotDataSource from "../datasources/timeslot.datasource";
import { ITimeSlotCreationBody, ITimeSlot, ITimeSlotDataSource } from "../interfaces/timeslot.interface";
import { FindOptions } from "sequelize";
import { TimeSlotUtils } from "../utils/timeslot.utils";

class TimeSlotService {
  private timeSlotDatasource: TimeSlotDataSource;
  constructor() {
    this.timeSlotDatasource = new TimeSlotDataSource();
  }

  async createTimeSlot(record: ITimeSlotCreationBody): Promise<ITimeSlot> {
    // Validate timeslot before creation
    const validation = TimeSlotUtils.validateTimeSlot(record.startTime, record.endTime);
    
    if (!validation.isValid) {
      throw new Error(`Timeslot validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Convert string dates to Date objects if needed
    const timeslotData = {
      ...record,
      startTime: TimeSlotUtils.toDate(record.startTime),
      endTime: TimeSlotUtils.toDate(record.endTime)
    };
    
    return this.timeSlotDatasource.create(timeslotData);
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