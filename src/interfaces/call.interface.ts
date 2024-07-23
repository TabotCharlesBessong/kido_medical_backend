import { FindOptions, Model, Optional } from "sequelize";

export interface ICall {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICallCreationBody
  extends Optional<ICall, "id" | "createdAt" | "updatedAt"> {}

export interface ICallModel extends Model<ICall, ICallCreationBody>, ICall {}

export interface ICallDataSource {
  create(record: ICallCreationBody): Promise<ICall>;
  fetchOne(query: IFindCallQuery): Promise<ICall | null>;
  updateOne(searchBy: IFindCallQuery, data: Partial<ICall>): Promise<void>;
  fetchAll(query: FindOptions<ICall>): Promise<ICall[]>;
}

export interface IFindCallQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}
