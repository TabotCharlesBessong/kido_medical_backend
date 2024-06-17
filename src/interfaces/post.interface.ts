import { FindOptions, Model, Optional } from "sequelize";

export interface IPost {
  id: string;
  doctorId: string;
  title: string;
  image: string;
  description: string;
  likesCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILike {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostCreationBody
  extends Optional<
    IPost,
    "id" | "createdAt" | "updatedAt" | "likesCount" | "status"
  > {}

export interface ICommentCreationBody
  extends Optional<IComment, "id" | "createdAt" | "updatedAt"> {}

export interface ILikeCreationBody
  extends Optional<ILike, "id" | "createdAt" | "updatedAt"> {}

export interface IPostModel extends Model<IPost, IPostCreationBody>, IPost {}

export interface ICommentModel
  extends Model<IComment, ICommentCreationBody>,
    IComment {}

export interface ILikeModel extends Model<ILike, ILikeCreationBody>, ILike {}

export interface IPostDataSource {
  fetchOne(query: IFindPostQuery): Promise<IPost | null>;
  create(record: IPostCreationBody): Promise<IPost>;
  updateOne(searchBy: IFindPostQuery, data: Partial<IPost>): Promise<void>;
  deleteOne(searchBy: IFindPostQuery): Promise<void>;
  fetchAllByDoctorId(doctorId: string): Promise<IPost[]>;
}

export interface ICommentDataSource {
  create(record: ICommentCreationBody): Promise<IComment>;
  fetchAll(query: FindOptions<IComment>): Promise<IComment[]>;
}

export interface ILikeDataSource {
  create(record: ILikeCreationBody): Promise<ILike>;
  deleteOne(searchBy: IFindLikeQuery): Promise<void>;
}

export interface IFindPostQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}

export interface IFindLikeQuery {
  where: {
    [key: string]: string;
  };
  raw?: boolean;
  returning?: boolean;
}
