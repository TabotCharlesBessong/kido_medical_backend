import { DataTypes, Model } from "sequelize";
import sequelize from "../database";
import {
  IKycVerification,
  IKycVerificationCreationBody,
} from "../interfaces/kycverification.interface";
import UserModel from "./user.model";

class KycVerification
  extends Model<IKycVerification, IKycVerificationCreationBody>
  implements IKycVerification
{
  public id!: number;
  public userId!: string;
  public documentType!: string;
  public documentUrl!: string;
  public specialistDocumentUrl?: string;
  public status!: "pending" | "approved" | "rejected";
  public reason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KycVerification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialistDocumentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "KycVerification",
    tableName: "kyc_verifications",
    timestamps: true,
  }
);

// Many-to-one relationship: Many KycVerifications belong to one User
KycVerification.belongsTo(UserModel, { foreignKey: "userId", as: "user" });
UserModel.hasMany(KycVerification, {
  foreignKey: "userId",
  as: "kycVerifications",
});

export default KycVerification;
