import { AppointmentStatus } from './enum/patient.enum';
import { FindOptions, Model, Optional, Transaction } from "sequelize";

export interface IAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  timeslotId: string;
  date: Date;
  reason: string;
  staus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointmentCreationBody
  extends Optional<IAppointment, "id"| "createdAt" | "updatedAt"> {}

export interface IAppointmentModel
  extends Model<IAppointment, IAppointmentCreationBody>,
    IAppointment {}

export interface IAppointmentDataSource {
  create(
    record: IAppointmentCreationBody,
    options?: Partial<IFindAppointmentQuery>
  ): Promise<IAppointment>;
  fetchOne(query: IFindAppointmentQuery): Promise<IAppointment | null>;
  updateOne(
    data: Partial<IAppointment>,
    query: IFindAppointmentQuery
  ): Promise<void>;
  fetchAll(query: FindOptions<IAppointment>): Promise<IAppointment[]>;
}

export interface IFindAppointmentQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  transaction?:Transaction
  returning?: boolean;
}
