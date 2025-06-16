import { DataTypes } from "sequelize"
import Db from "../database"
import { IUserModel } from "../interfaces/user.interfaces"
import { v4 as uuidv4 } from "uuid"
import { AccountStatus, EmailStatus } from "../interfaces/enum/user.enum"

const UserModel = Db.define<IUserModel>('UserModel',{
  id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isEmailVerified: {
      type: DataTypes.ENUM(EmailStatus.VERIFIED, EmailStatus.NOT_VERIFIED),
      allowNull: false,
      defaultValue: EmailStatus.NOT_VERIFIED,
    },
    accountStatus: {
      type: DataTypes.ENUM(AccountStatus.ACTIVE, AccountStatus.INACTIVE, AccountStatus.SUSPENDED),
      allowNull: false,
      defaultValue: AccountStatus.ACTIVE,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'users',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
)

export default UserModel