import { FindOptions, Model, Optional } from "sequelize";

export interface ICall {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId: string;
  streamCallId?: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

export interface ICallCreationBody
  extends Optional<ICall, "id" | "streamCallId" | "createdAt" | "updatedAt"> {}

export interface ICallModel extends Model<ICall, ICallCreationBody>, ICall {}

export interface IFindCallQuery {
  where: {
    id?: string;
    doctorId?: string;
    patientId?: string;
    appointmentId?: string;
    status?: string;
  };
}

export interface ICallDataSource {
  create(record: ICallCreationBody): Promise<ICall>;
  fetchOne(query: IFindCallQuery): Promise<ICall | null>;
  updateOne(searchBy: IFindCallQuery, data: Partial<ICall>): Promise<void>;
  fetchAll(query: FindOptions<ICall>): Promise<ICall[]>;
  deleteOne(searchBy: IFindCallQuery): Promise<void>;
}
