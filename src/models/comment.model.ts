import { DataTypes } from "sequelize";
import Db from "../database";
import { ICommentModel } from "../interfaces/post.interface";
import { v4 as uuidv4 } from "uuid";
import UserModel from "./user.model";
import PostModel from "./post.model";

const CommentModel = Db.define<ICommentModel>(
  "CommentModel",
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: "comments",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

PostModel.hasMany(CommentModel,{
  foreignKey:"postId",
  as:"postComments"
})

CommentModel.belongsTo(PostModel,{
  foreignKey:"postId",
  as:"commentPost"
})

UserModel.hasOne(CommentModel, {
  foreignKey: "userId",
  as: "userComment",
});
CommentModel.belongsTo(UserModel, {
  foreignKey: "userId",
  as:"commentUser"
});

export default CommentModel;
