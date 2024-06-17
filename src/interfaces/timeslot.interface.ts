import { FindOptions, Model, Optional } from "sequelize";

export interface ITimeSlot {
  id: string;
  doctorId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFindTimeSlotQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning: boolean;
}

export interface ITimeSlotCreationBody
  extends Optional<ITimeSlot, "id" | "createdAt" | "updatedAt"> {}

export interface ITimeSlotModel extends Model<ITimeSlot, ITimeSlotCreationBody>, ITimeSlot {}

export interface ITimeSlotDataSource {
  fetchOne(query: IFindTimeSlotQuery): Promise<ITimeSlot | null>;
  create(record: ITimeSlotCreationBody): Promise<ITimeSlot>;
  updateOne(
    searchBy: IFindTimeSlotQuery,
    data: Partial<ITimeSlot>
  ): Promise<void>;
  fetchAll(query: FindOptions<ITimeSlot>): Promise<ITimeSlot[]>;
}
