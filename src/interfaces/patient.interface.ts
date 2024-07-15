import { FindOptions, Model, Optional } from "sequelize";

export interface IPatient {
  id: string;
  userId: string;
  gender: string;
  age: number;
  address1: string; // New field for city
  address2: string; // New field for street
  occupation: string; // New field for occupation
  phoneNumber: string; // New field for phone number
  tribe: string; // New field for tribe
  religion: string; // New field for religion
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
  fetchAll(query: FindOptions<IPatient>): Promise<IPatient[]>;
}

export interface IFindPatientQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}
