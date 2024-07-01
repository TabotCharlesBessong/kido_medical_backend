import { FindOptions, Model, Optional, Transaction } from "sequelize";
import { IMedication } from "./medication.interface";

export interface IPrescription {
  id: string;
  consultationId: string;
  instructions?: string;
  investigation?:string
  medications: string[]
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescriptionCreationBody
  extends Optional<IPrescription, "id" | "createdAt" | "updatedAt"> {}

export interface IPrescriptionModel
  extends Model<IPrescription, IPrescriptionCreationBody>,
    IPrescription {}

export interface IPrescriptionDataSource {
  create(record: IPrescriptionCreationBody): Promise<IPrescription>;
  fetchOne(query: IFindPrescriptionQuery): Promise<IPrescription | null>;
  updateOne(
    data: Partial<IPrescription>,
    query: IFindPrescriptionQuery
  ): Promise<void>;
  fetchAll(query: FindOptions<IPrescription>): Promise<IPrescription[]>;
}

export interface IFindPrescriptionQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  transaction?: Transaction;
  returning?: boolean;
}
