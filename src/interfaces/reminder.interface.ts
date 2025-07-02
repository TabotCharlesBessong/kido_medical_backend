import { FindOptions, Model, Optional } from "sequelize";

export interface IReminder {
  id: string;
  appointmentId: string;
  recipientId: string; // can be either doctorId or patientId
  recipientType: "DOCTOR" | "PATIENT";
  reminderType: "30_MINUTES" | "10_MINUTES";
  status: "PENDING" | "SENT" | "FAILED";
  scheduledFor: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReminderCreationBody
  extends Optional<IReminder, "id" | "status" | "createdAt" | "updatedAt"> {}

export interface IReminderModel extends Model<IReminder, IReminderCreationBody>, IReminder {}

export interface IFindReminderQuery {
  where: {
    id?: string;
    appointmentId?: string;
    recipientId?: string;
    recipientType?: "DOCTOR" | "PATIENT";
    reminderType?: "30_MINUTES" | "10_MINUTES";
    status?: "PENDING" | "SENT" | "FAILED";
  };
}

export interface IReminderDataSource {
  create(record: IReminderCreationBody): Promise<IReminder>;
  fetchOne(query: IFindReminderQuery): Promise<IReminder | null>;
  updateOne(searchBy: IFindReminderQuery, data: Partial<IReminder>): Promise<void>;
  fetchAll(query: FindOptions<IReminder>): Promise<IReminder[]>;
  deleteOne(searchBy: IFindReminderQuery): Promise<void>;
}