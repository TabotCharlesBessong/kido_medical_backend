import { FindOptions, Model, Optional } from "sequelize";

export interface IAppointment {
  id: string;
  doctorId: string;
  patientId: string;
  timeSlotId: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  streamChannelId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointmentCreationBody
  extends Optional<IAppointment, "id" | "streamChannelId" | "createdAt" | "updatedAt"> {}

export interface IAppointmentModel extends Model<IAppointment, IAppointmentCreationBody>, IAppointment {}

export interface IFindAppointmentQuery {
  where: {
    id?: string;
    doctorId?: string;
    patientId?: string;
    timeSlotId?: string;
    status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  };
}

export interface IAppointmentDataSource {
  create(record: IAppointmentCreationBody): Promise<IAppointment>;
  fetchOne(query: IFindAppointmentQuery): Promise<IAppointment | null>;
  updateOne(searchBy: IFindAppointmentQuery, data: Partial<IAppointment>): Promise<void>;
  fetchAll(query: FindOptions<IAppointment>): Promise<IAppointment[]>;
  deleteOne(searchBy: IFindAppointmentQuery): Promise<void>;
}
