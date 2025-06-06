import { FindOptions, Model, Optional } from "sequelize";

export interface IDoctor {
  id: string;
  userId: string;
  specialization: string;
  verificationStatus: string;
  isVerified: boolean;
  verificationNotes?: string;
  verifiedAt?: Date | null;
  documents: string;
  fee: number;
  language: string[];
  experience: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFindDoctorQuery {
  where: {
    id?: string;
    userId?: string;
    isVerified?: boolean;
  };
}

export interface IDoctorCreationBody
  extends Optional<IDoctor, "id" | "createdAt" | "updatedAt"> {}

export interface IDoctorModel
  extends Model<IDoctor, IDoctorCreationBody>,
    IDoctor {}

export interface IDoctorDataSource {
  create(record: IDoctorCreationBody): Promise<IDoctor>;
  fetchOne(query: IFindDoctorQuery): Promise<IDoctor | null>;
  updateOne(searchBy: IFindDoctorQuery, data: Partial<IDoctor>): Promise<void>;
  fetchAll(query: FindOptions<IDoctor>): Promise<IDoctor[]>;
}
