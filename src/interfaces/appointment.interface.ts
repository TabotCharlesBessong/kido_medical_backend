import { FindOptions, Model, Optional } from "sequelize";

export interface IAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  timeslotId: string;
  date: Date;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointmentCreationBody
  extends Optional<IAppointment, "id" | "createdAt" | "updatedAt"> {}

export interface IAppointmentModel
  extends Model<IAppointment, IAppointmentCreationBody>,
    IAppointment {}

export interface IAppointmentDataSource {
  create(record: IAppointmentCreationBody): Promise<IAppointment>;
  fetchOne(query: IFindAppointmentQuery): Promise<IAppointment | null>;
  updateOne(
    searchBy: IFindAppointmentQuery,
    data: Partial<IAppointment>
  ): Promise<void>;
  fetchAll(query: FindOptions<IAppointment>): Promise<IAppointment[]>;
}

export interface IFindAppointmentQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}
