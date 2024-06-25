import { FindOptions, Model, Optional, Transaction } from "sequelize";

export interface IConsultation {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  presentingComplaints: string;
  pastHistory: string;
  diagnosticImpression: string;
  investigations: string;
  treatment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConsultationCreationBody
  extends Optional<IConsultation, "id" | "createdAt" | "updatedAt"> {}

export interface IConsultationModel
  extends Model<IConsultation, IConsultationCreationBody>,
    IConsultation {}

export interface IConsultationDataSource {
  create(
    record: IConsultationCreationBody,
    options?: Partial<IFindConsultationQuery>
  ): Promise<IConsultation>;
  fetchOne(query: IFindConsultationQuery): Promise<IConsultation | null>;
  updateOne(
    data: Partial<IConsultation>,
    query: IFindConsultationQuery
  ): Promise<void>;
  fetchAll(query: FindOptions<IConsultation>): Promise<IConsultation[]>;
  deleteOne(searchBy: IFindConsultationQuery): Promise<void>;
}

export interface IFindConsultationQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  transaction?: Transaction;
  returning?: boolean;
}