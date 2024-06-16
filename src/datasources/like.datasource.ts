import { ILike, ILikeCreationBody, ILikeDataSource, IFindLikeQuery } from "../interfaces/post.interface";
import LikeModel from "../models/like.model";

class LikeDataSource implements ILikeDataSource {
  async create(record: ILikeCreationBody): Promise<ILike> {
    return await LikeModel.create(record);
  }

  async deleteOne(searchBy: IFindLikeQuery): Promise<void> {
    await LikeModel.destroy(searchBy);
  }
}

export default LikeDataSource;