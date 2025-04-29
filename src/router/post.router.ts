import express, { Request, Response, NextFunction } from "express";
import PostController from "../controllers/post.controller";
import {
  Auth,
  DoctorMiddleware,
  validator,
} from "../middlewares/index.middlewares";
import validationSchema from "../validators/post.validator.schema";

const createPostRoute = () => {
  const router = express.Router();
  const postController = new PostController();

  router.post(
    "/create",
    validator(validationSchema.createPostSchema),
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await postController.createPost(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/:postId", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await postController.getPostById(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get("/post/all", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await postController.getAllPosts(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.put(
    "/:postId",
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await postController.updatePost(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/:postId",
    DoctorMiddleware(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await postController.deletePost(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/doctor/:doctorId", Auth(), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await postController.getAllPostsByDoctor(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/:postId/comment",
    validator(validationSchema.createCommentSchema),
    Auth(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await postController.addCommentToPost(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/:postId/like",
    Auth(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await postController.addLikeToPost(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/:postId/like",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await postController.removeLikeFromPost(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export default createPostRoute();
