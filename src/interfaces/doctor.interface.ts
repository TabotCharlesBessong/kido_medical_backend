import { Model, Optional } from "sequelize";

export interface IDoctor {
  id: string;
  userId: string;
  specialization: string;
  verificationStatus: string;
  documents: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFindDoctorQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}

export interface IDoctorCreationBody
  extends Optional<IDoctor, "id" | "createdAt" | "updatedAt"> {}

export interface IDoctorModel
  extends Model<IDoctor, IDoctorCreationBody>,
    IDoctor {}

export interface IDoctorDataSource {
  fetchOne(query: IFindDoctorQuery): Promise<IDoctor | null>;
  create(record: IDoctorCreationBody): Promise<IDoctor>;
  updateOne(searchBy: IFindDoctorQuery, data: Partial<IDoctor>): Promise<void>;
}