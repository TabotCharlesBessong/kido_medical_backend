import { FindOptions } from "sequelize";
import {
  IKycVerification,
  IKycVerificationCreationBody,
  IKycVerificationDataSource,
  IFindKycVerificationQuery,
} from "../interfaces/kycverification.interface";
import KycVerificationModel from "../models/kycverification.model";
import UserModel from "../models/user.model";

class KycVerificationDataSource implements IKycVerificationDataSource {
  async create(
    record: IKycVerificationCreationBody
  ): Promise<IKycVerification> {
    return await KycVerificationModel.create(record);
  }

  async fetchOne(
    query: IFindKycVerificationQuery
  ): Promise<IKycVerification | null> {
    return await KycVerificationModel.findOne({
      ...query,
      include: [
        {
          model: UserModel,
          as: "user",
        },
      ],
    });
  }

  async updateOne(
    searchBy: IFindKycVerificationQuery,
    data: Partial<IKycVerification>
  ): Promise<void> {
    await KycVerificationModel.update(data, searchBy);
  }

  async fetchAll(
    query: FindOptions<IKycVerification>
  ): Promise<IKycVerification[]> {
    return await KycVerificationModel.findAll({
      ...query,
      include: [
        {
          model: UserModel,
          as: "user",
        },
      ],
    });
  }
}

export default KycVerificationDataSource;
