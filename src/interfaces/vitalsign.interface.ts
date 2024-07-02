import { FindOptions, Model, Optional, Transaction } from "sequelize";

export interface IVitalSign {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  weight: number;
  height: number;
  bloodPressure: string;
  pulse: number;
  respiratoryRate: number;
  temperature: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVitalSignCreationBody
  extends Optional<IVitalSign, "id" | "createdAt" | "updatedAt"> {}

export interface IVitalSignModel
  extends Model<IVitalSign, IVitalSignCreationBody>,
    IVitalSign {}

export interface IVitalSignDataSource {
  create(
    record: IVitalSignCreationBody,
    options?: Partial<IFindVitalSignQuery>
  ): Promise<IVitalSign>;
  fetchOne(query: IFindVitalSignQuery): Promise<IVitalSign | null>;
  updateOne(
    data: Partial<IVitalSign>,
    query: IFindVitalSignQuery
  ): Promise<void>;
  fetchAll(query: FindOptions<IVitalSign>): Promise<IVitalSign[]>;
}

export interface IFindVitalSignQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  transaction?: Transaction;
  returning?: boolean;
}