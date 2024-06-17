import { FindOptions } from "sequelize";
import {
  IComment,
  ICommentCreationBody,
  ICommentDataSource,
} from "../interfaces/post.interface";
import CommentModel from "../models/comment.model";

class CommentDataSource implements ICommentDataSource {
  async create(record: ICommentCreationBody): Promise<IComment> {
    return await CommentModel.create(record);
  }

  async fetchAll(query: FindOptions<IComment>): Promise<IComment[]> {
    return await CommentModel.findAll(query);
  }
}

export default CommentDataSource;
