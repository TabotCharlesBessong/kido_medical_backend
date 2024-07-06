import {
  IFindPostQuery,
  IPost,
  IPostCreationBody,
  IPostDataSource,
} from "../interfaces/post.interface";
import PostModel from "../models/post.model";
import CommentModel from "../models/comment.model";
import LikeModel from "../models/like.model";
import UserModel from "../models/user.model";
import DoctorModel from "../models/doctor.model";
import { FindOptions } from "sequelize";

class PostDataSource implements IPostDataSource {
  async create(record: IPostCreationBody): Promise<IPost> {
    return await PostModel.create(record);
  }

  async fetchOne(query: IFindPostQuery): Promise<IPost | null> {
    return await PostModel.findOne({
      ...query,
      include: [
        { model: CommentModel, as: "postComments" },
        {
          model: LikeModel,
          as: "postLikes",
          include: [{ model: UserModel, as: "likeUser" }],
        },
        {
          model: DoctorModel,
          as: "postDoctor",
        },
      ],
    });
  }

  async updateOne(
    searchBy: IFindPostQuery,
    data: Partial<IPost>
  ): Promise<void> {
    await PostModel.update(data, searchBy);
  }

  async deleteOne(searchBy: IFindPostQuery): Promise<void> {
    await PostModel.destroy(searchBy);
  }

  async fetchAllByDoctorId(doctorId: string): Promise<IPost[]> {
    return await PostModel.findAll({
      where: { doctorId },
      include: [
        { model: CommentModel, as: "postComments" },
        {
          model: LikeModel,
          as: "postLikes",
          include: [{ model: UserModel, as: "likeUser" }],
        },
      ],
    });
  }

  async fetchAllPost(query: FindOptions<IPost>): Promise<IPost[]> {
    return await PostModel.findAll({
      ...query,
      include: [
        { model: CommentModel, as: "postComments" },
        {
          model: LikeModel,
          as: "postLikes",
          include: [{ model: UserModel, as: "likeUser" }],
        },
      ],
    });
  }
}

export default PostDataSource;
