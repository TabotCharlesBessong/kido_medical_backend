import { Request, Response } from "express";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code.enum";
import PostService from "../services/post.service";

class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  async createPost(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newPost = {
        doctorId: params.user.id,
        title: params.title,
        image: params.image,
        description: params.description,
      };
      const post = await this.postService.createPost(newPost);
      return Utility.handleSuccess(
        res,
        "Post created successfully",
        { post },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const post = await this.postService.getPostById(postId);
      if (!post) {
        return Utility.handleError(
          res,
          "Post not found",
          ResponseCode.NOT_FOUND
        );
      }
      return Utility.handleSuccess(
        res,
        "Post retrieved successfully",
        { post },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const data = { ...req.body };
      const post = await this.postService.updatePost(postId, data);
      return Utility.handleSuccess(
        res,
        "Post updated successfully",
        {post},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      await this.postService.deletePost(postId);
      return Utility.handleSuccess(
        res,
        "Post deleted successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getAllPostsByDoctor(req: Request, res: Response) {
    try {
      const doctorId = req.params.doctorId;
      const posts = await this.postService.getAllPostsByDoctor(doctorId);
      return Utility.handleSuccess(
        res,
        "Posts retrieved successfully",
        { posts },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async addCommentToPost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const userId = req.body.params.user.id;
      const content = req.body.content;
      await this.postService.addCommentToPost(postId, userId, content);
      return Utility.handleSuccess(
        res,
        "Comment added successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async addLikeToPost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const userId = req.body.userId;
      await this.postService.addLikeToPost(postId, userId);
      return Utility.handleSuccess(
        res,
        "Like added successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async removeLikeFromPost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const userId = req.body.userId;
      await this.postService.removeLikeFromPost(postId, userId);
      return Utility.handleSuccess(
        res,
        "Like removed successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }
}

export default PostController;
