import { DataTypes } from "sequelize";
import Db from "../database";
import { IPostModel } from "../interfaces/post.interface";
import { v4 as uuidv4 } from "uuid";
import DoctorModel from "./doctor.model";

const PostModel = Db.define<IPostModel>(
  "PostModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      allowNull: false,
      primaryKey: true,
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: DoctorModel,
        key: "userId",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "ACTIVE",
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
    tableName: "posts",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

DoctorModel.hasMany(PostModel,{
  foreignKey:"doctorId",
  as:"doctorPosts"
})

PostModel.belongsTo(DoctorModel,{
  foreignKey:"doctorId",
  as:"postDoctor"
})

export default PostModel;
