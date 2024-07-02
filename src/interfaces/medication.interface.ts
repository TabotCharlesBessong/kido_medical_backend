import { FindOptions, Model, Optional, Transaction } from "sequelize";
import { Frequency } from "./enum/doctor.enum";

export interface IMedication {
  id: string;
  prescriptionId: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  duration: number; // in days
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedicationCreationBody
  extends Optional<IMedication, "id" | "createdAt" | "updatedAt"> {}

export interface IMedicationModel
  extends Model<IMedication, IMedicationCreationBody>,
    IMedication {}

export interface IMedicationDataSource {
  create(
    record: IMedicationCreationBody,
    options?: Partial<IFindMedicationQuery>
  ): Promise<IMedication>;
  fetchOne(query: IFindMedicationQuery): Promise<IMedication | null>;
  updateOne(
    data: Partial<IMedication>,
    query: IFindMedicationQuery
  ): Promise<void>;
  fetchAll(query: FindOptions<IMedication>): Promise<IMedication[]>;
}

export interface IFindMedicationQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  transaction?: Transaction;
  returning?: boolean;
}
