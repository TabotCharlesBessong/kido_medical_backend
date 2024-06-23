import express, { Request, Response } from "express";
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
    (req: Request, res: Response) => {
      return postController.createPost(req, res);
    }
  );

  router.get("/:postId", Auth(), (req: Request, res: Response) => {
    return postController.getPostById(req, res);
  });

  router.get("/all", Auth(), (req: Request, res: Response) => {
    return postController.getAllPosts(req, res);
  });

  router.put(
    "/:postId",
    validator(validationSchema.updatePostSchema),
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      return postController.updatePost(req, res);
    }
  );

  router.delete(
    "/:postId",
    DoctorMiddleware(),
    (req: Request, res: Response) => {
      return postController.deletePost(req, res);
    }
  );

  router.get("/doctor/:doctorId",Auth(), (req: Request, res: Response) => {
    return postController.getAllPostsByDoctor(req, res);
  });

  router.post(
    "/:postId/comment",
    validator(validationSchema.createCommentSchema),
    Auth(),
    (req: Request, res: Response) => {
      return postController.addCommentToPost(req, res);
    }
  );

  router.post(
    "/:postId/like",
    // validator(validationSchema.addLikeSchema),
    Auth(),
    (req: Request, res: Response) => {
      return postController.addLikeToPost(req, res);
    }
  );

  router.delete(
    "/:postId/like",
    // validator(validationSchema.removeLikeSchema),
    (req: Request, res: Response) => {
      return postController.removeLikeFromPost(req, res);
    }
  );

  return router;
};

export default createPostRoute();
