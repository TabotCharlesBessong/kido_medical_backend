import { Model, Optional } from "sequelize";

export interface IPatient {
  id: string;
  userId: string;
  gender: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPatientCreationBody
  extends Optional<IPatient, "id" | "createdAt" | "updatedAt"> {}

export interface IPatientModel
  extends Model<IPatient, IPatientCreationBody>,
    IPatient {}

export interface IPatientDataSource {
  create(record: IPatientCreationBody): Promise<IPatient>;
  fetchOne(query: IFindPatientQuery): Promise<IPatient | null>;
  updateOne(
    searchBy: IFindPatientQuery,
    data: Partial<IPatient>
  ): Promise<void>;
}

export interface IFindPatientQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}
