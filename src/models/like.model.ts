import { DataTypes } from "sequelize";
import Db from "../database";
import { ILikeModel } from "../interfaces/post.interface";
import { v4 as uuidv4 } from "uuid";
import PostModel from "./post.model";
import UserModel from "./user.model";

const LikeModel = Db.define<ILikeModel>(
  "LikeModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      allowNull: false,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: PostModel,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
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
    tableName: "likes",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

PostModel.hasMany(LikeModel, {
  foreignKey: "postId",
  as: "postLikes",
});

LikeModel.belongsTo(PostModel, {
  foreignKey: "postId",
  as:"likePost"
});

UserModel.hasOne(LikeModel, {
  foreignKey: "userId",
  as: "userLikes",
});
LikeModel.belongsTo(UserModel, {
  foreignKey: "userId",
  as:"likeUser"
});

export default LikeModel;
