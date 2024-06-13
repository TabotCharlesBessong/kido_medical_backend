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
  // async getTimeSlotById(id: string): Promise<ITimeSlot | null> {
  //   return await TimeSlotDataSource.getTimeSlotById(id);
  // }

  // async updateTimeSlot(id: string, data: Partial<ITimeSlot>): Promise<void> {
  //   await timeSlotDataSource.updateTimeSlot(id, data);
  // }

  // async deleteTimeSlot(id: string): Promise<void> {
  //   await timeSlotDataSource.deleteTimeSlot(id);
  // }

  // async getAvailableTimeSlots(doctorId: string): Promise<ITimeSlot[]> {
  //   return await timeSlotDataSource.getAvailableTimeSlots(doctorId);
  // }
}

export default TimeSlotService