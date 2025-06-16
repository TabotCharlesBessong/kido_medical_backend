import { FindOptions, Model, Optional, Transaction } from "sequelize";
import { IMedication } from "./medication.interface";

export interface IPrescription {
  id: string;
  consultationId: string;
  instructions?: string;
  investigation?: string;
  medications?: IMedication[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescriptionModel extends Model<IPrescription>, IPrescription {}

export interface IPrescriptionCreationBody
  extends Optional<IPrescription, "id" | "createdAt" | "updatedAt" | "medications"> {}

export interface IFindPrescriptionQuery extends FindOptions<IPrescription> {
  where: {
    id?: string;
    consultationId?: string;
  };
}

export interface IPrescriptionDataSource {
  create(
    record: IPrescriptionCreationBody,
    options?: Partial<IFindPrescriptionQuery>
  ): Promise<IPrescription>;
  fetchOne(query: IFindPrescriptionQuery): Promise<IPrescription | null>;
  fetchById(PrescriptionId: string): Promise<IPrescription | null>;
  updateOne(
    data: Partial<IPrescription>,
    query: IFindPrescriptionQuery
  ): Promise<void>;
  deleteOne(searchBy: IFindPrescriptionQuery): Promise<void>;
  fetchAll(query: FindOptions<IPrescription>): Promise<IPrescription[]>;
}
