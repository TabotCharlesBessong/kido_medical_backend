import { FindOptions, Model, Optional } from "sequelize";

export interface IKycVerification {
  id: number;
  userId: string;
  documentType: string;
  documentUrl: string;
  specialistDocumentUrl?: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IKycVerificationCreationBody
  extends Optional<
    IKycVerification,
    | "id"
    | "specialistDocumentUrl"
    | "status"
    | "reason"
    | "createdAt"
    | "updatedAt"
  > {}

export interface IKycVerificationModel
  extends Model<IKycVerification, IKycVerificationCreationBody>,
    IKycVerification {}

export interface IFindKycVerificationQuery {
  where: {
    id?: number;
    userId?: string;
  };
}

export interface IKycVerificationDataSource {
  create(record: IKycVerificationCreationBody): Promise<IKycVerification>;
  fetchOne(query: IFindKycVerificationQuery): Promise<IKycVerification | null>;
  updateOne(
    searchBy: IFindKycVerificationQuery,
    data: Partial<IKycVerification>
  ): Promise<void>;
  fetchAll(query: FindOptions<IKycVerification>): Promise<IKycVerification[]>;
}
