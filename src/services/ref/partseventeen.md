Certainly! Here is the updated code with added relationships between tables and the changes to include the number of likes, comments, and users who liked the post. The validation schema will now use Yup instead of Joi.

### Enums

```typescript
// post.enum.ts
export const PostStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DELETED: "DELETED",
};
```

### Interfaces

```typescript
// post.interface.ts
import { Model, Optional } from "sequelize";

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

export interface IPostCreationBody extends Optional<IPost, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'status'> {}

export interface ICommentCreationBody extends Optional<IComment, 'id' | 'createdAt' | 'updatedAt'> {}

export interface ILikeCreationBody extends Optional<ILike, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IPostModel extends Model<IPost, IPostCreationBody>, IPost {}

export interface ICommentModel extends Model<IComment, ICommentCreationBody>, IComment {}

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
```

### Models

```typescript
// post.model.ts
import { DataTypes } from "sequelize";
import Db from "../database";
import { IPostModel } from "../interfaces/post.interfaces";
import { v4 as uuidv4 } from "uuid";

const PostModel = Db.define<IPostModel>('PostModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
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
    defaultValue: 'ACTIVE',
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
}, {
  timestamps: true,
  tableName: 'posts',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// Associations
PostModel.associate = (models) => {
  PostModel.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
  PostModel.hasMany(models.Comment, { foreignKey: 'postId', as: 'comments' });
  PostModel.hasMany(models.Like, { foreignKey: 'postId', as: 'likes' });
};

export default PostModel;
```

```typescript
// comment.model.ts
import { DataTypes } from "sequelize";
import Db from "../database";
import { ICommentModel } from "../interfaces/post.interfaces";
import { v4 as uuidv4 } from "uuid";

const CommentModel = Db.define<ICommentModel>('CommentModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
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
}, {
  timestamps: true,
  tableName: 'comments',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// Associations
CommentModel.associate = (models) => {
  CommentModel.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
  CommentModel.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

export default CommentModel;
```

```typescript
// like.model.ts
import { DataTypes } from "sequelize";
import Db from "../database";
import { ILikeModel } from "../interfaces/post.interfaces";
import { v4 as uuidv4 } from "uuid";

const LikeModel = Db.define<ILikeModel>('LikeModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
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
}, {
  timestamps: true,
  tableName: 'likes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// Associations
LikeModel.associate = (models) => {
  LikeModel.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
  LikeModel.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

export default LikeModel;
```

### Data Sources

```typescript
// post.datasource.ts
import { IFindPostQuery, IPost, IPostCreationBody, IPostDataSource } from "../interfaces/post.interfaces";
import PostModel from "../models/post.model";
import CommentModel from "../models/comment.model";
import LikeModel from "../models/like.model";
import UserModel from "../models/user.model";

class PostDataSource implements IPostDataSource {
  async create(record: IPostCreationBody): Promise<IPost> {
    return await PostModel.create(record);
  }

  async fetchOne(query: IFindPostQuery): Promise<IPost | null> {
    return await PostModel.findOne({
      ...query,
      include: [
        { model: CommentModel, as: 'comments' },
        { model: LikeModel, as: 'likes', include: [{ model: UserModel, as: 'user' }] },
      ],
    });
  }

  async updateOne(searchBy: IFindPostQuery, data: Partial<IPost>): Promise<void> {
    await PostModel.update(data, searchBy);
  }

  async deleteOne(searchBy: IFindPostQuery): Promise<void> {
    await PostModel.destroy(searchBy);
  }

  async fetchAllByDoctorId(doctorId: string): Promise<IPost[]> {
    return await PostModel.findAll({
      where: { doctorId },
      include: [
        { model: CommentModel, as: 'comments' },
        { model: LikeModel, as: 'likes', include: [{ model: UserModel, as: 'user' }] },
      ],
    });
  }
}

export default PostDataSource;
```

```typescript
// comment.datasource.ts
import { IComment, ICommentCreationBody, ICommentDataSource } from "../interfaces/post.interfaces";
import CommentModel from "../models/comment.model";

class CommentDataSource implements ICommentDataSource {
  async create(record: ICommentCreationBody): Promise<IComment> {
    return await CommentModel.create(record);
  }
}

export default CommentDataSource;
```

```typescript
// like.datasource.ts
import { ILike, ILikeCreationBody, ILikeDataSource, IFindLikeQuery } from "../interfaces/post.interfaces";
import Like

Model from "../models/like.model";

class LikeDataSource implements ILikeDataSource {
  async create(record: ILikeCreationBody): Promise<ILike> {
    return await LikeModel.create(record);
  }

  async deleteOne(searchBy: IFindLikeQuery): Promise<void> {
    await LikeModel.destroy(searchBy);
  }
}

export default LikeDataSource;
```

### Services

```typescript
// post.service.ts
import { IPost, IPostCreationBody } from "../interfaces/post.interfaces";
import PostDataSource from "../datasources/post.datasource";
import CommentDataSource from "../datasources/comment.datasource";
import LikeDataSource from "../datasources/like.datasource";

class PostService {
  private postDataSource: PostDataSource;
  private commentDataSource: CommentDataSource;
  private likeDataSource: LikeDataSource;

  constructor() {
    this.postDataSource = new PostDataSource();
    this.commentDataSource = new CommentDataSource();
    this.likeDataSource = new LikeDataSource();
  }

  async createPost(data: IPostCreationBody): Promise<IPost> {
    return await this.postDataSource.create(data);
  }

  async getPostById(postId: string): Promise<IPost | null> {
    return await this.postDataSource.fetchOne({ where: { id: postId } });
  }

  async updatePost(postId: string, data: Partial<IPost>): Promise<void> {
    await this.postDataSource.updateOne({ where: { id: postId } }, data);
  }

  async deletePost(postId: string): Promise<void> {
    await this.postDataSource.deleteOne({ where: { id: postId } });
  }

  async getAllPostsByDoctor(doctorId: string): Promise<IPost[]> {
    return await this.postDataSource.fetchAllByDoctorId(doctorId);
  }

  async addCommentToPost(postId: string, userId: string, content: string) {
    await this.commentDataSource.create({ postId, userId, content });
  }

  async addLikeToPost(postId: string, userId: string) {
    await this.likeDataSource.create({ postId, userId });
    const post = await this.getPostById(postId);
    if (post) {
      await this.updatePost(postId, { likesCount: post.likesCount + 1 });
    }
  }

  async removeLikeFromPost(postId: string, userId: string) {
    await this.likeDataSource.deleteOne({ where: { postId, userId } });
    const post = await this.getPostById(postId);
    if (post) {
      await this.updatePost(postId, { likesCount: post.likesCount - 1 });
    }
  }
}

export default PostService;
```

### Controller

```typescript
// post.controller.ts
import { Request, Response } from "express";
import PostService from "../services/post.service";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code.enum";

class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  async createPost(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newPost = {
        doctorId: params.doctorId,
        title: params.title,
        image: params.image,
        description: params.description,
      };
      const post = await this.postService.createPost(newPost);
      return Utility.handleSuccess(res, "Post created successfully", { post }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const post = await this.postService.getPostById(postId);
      if (!post) {
        return Utility.handleError(res, "Post not found", ResponseCode.NOT_FOUND);
      }
      return Utility.handleSuccess(res, "Post retrieved successfully", { post }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const data = { ...req.body };
      await this.postService.updatePost(postId, data);
      return Utility.handleSuccess(res, "Post updated successfully", {}, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      await this.postService.deletePost(postId);
      return Utility.handleSuccess(res, "Post deleted successfully", {}, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getAllPostsByDoctor(req: Request, res: Response) {
    try {
      const doctorId = req.params.doctorId;
      const posts = await this.postService.getAllPostsByDoctor(doctorId);
      return Utility.handleSuccess(res, "Posts retrieved successfully", { posts }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async addCommentToPost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const userId = req.body.userId;
      const content = req.body.content;
      await this.postService.addCommentToPost(postId, userId, content);
      return Utility.handleSuccess(res, "Comment added successfully", {}, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async addLikeToPost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const userId = req.body.userId;
      await this.postService.addLikeToPost(postId, userId);
      return Utility.handleSuccess(res, "Like added successfully", {}, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async removeLikeFromPost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const userId = req.body.userId;
      await this.postService.removeLikeFromPost(postId, userId);
      return Utility.handleSuccess(res, "Like removed successfully", {}, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }
}

export default PostController;
```

### Routes

```typescript
// post.router.ts
import express, { Request, Response } from "express";
import PostController from "../controllers/post.controller";
import { validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/post.validator.schema";

const createPostRoute = () => {
  const router = express.Router();
  const postController = new PostController();

  router.post(
    "/",
    validator(validationSchema.createPostSchema),
    (req: Request, res: Response) => {
      return postController.createPost(req, res);
    }
  );

  router.get(
    "/:postId",
    (req: Request, res: Response) => {
      return postController.getPostById(req, res);
    }
  );

  router.put(
    "/:postId",
    validator(validationSchema.updatePostSchema),
    (req: Request, res: Response) => {
      return postController.updatePost(req, res);
    }
  );

  router.delete(
    "/:postId",
    (req: Request, res: Response) => {
      return postController.deletePost(req, res);
    }
  );

  router.get(
    "/doctor/:doctorId",
    (req: Request, res: Response) => {
      return postController.getAllPostsByDoctor(req, res);
    }
  );

  router.post(
    "/:postId/comment",
    validator(validationSchema.addCommentSchema),
    (req: Request, res: Response) => {
      return postController.addCommentToPost(req, res);
    }
  );

  router.post(
    "/:postId/like",
    validator(validationSchema.addLikeSchema),
    (req: Request, res: Response) => {
      return postController.addLikeToPost(req, res);
    }
  );

  router.delete(
    "/:postId/like",
    validator(validationSchema.removeLikeSchema),
    (req: Request, res: Response) => {
      return postController.removeLikeFromPost(req, res);
    }
  );

  return router;
};

export default createPostRoute;
```

### Validator Schemas

```typescript
// post.validator.schema.ts
import * as yup from "yup";

const createPostSchema = yup.object().shape({
  doctorId: yup.string().required(),
  title: yup.string().required(),
  image: yup.string().optional(),
  description: yup.string().required(),
});

const updatePostSchema = yup.object().shape({
  title: yup.string().optional(),
  image: yup.string().optional(),
  description: yup.string().optional(),
  status: yup.string().optional