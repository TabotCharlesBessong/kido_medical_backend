import { IPost, IPostCreationBody } from "../interfaces/post.interface";
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

  async getPosts(): Promise<IPost[]> {
    const query = { where: {}, raw: true };
    return this.postDataSource.fetchAllPost(query);
  }
}

export default PostService;
