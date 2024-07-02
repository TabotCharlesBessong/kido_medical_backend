"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_controller_1 = __importDefault(require("../controllers/post.controller"));
const index_middlewares_1 = require("../middlewares/index.middlewares");
const post_validator_schema_1 = __importDefault(require("../validators/post.validator.schema"));
const createPostRoute = () => {
    const router = express_1.default.Router();
    const postController = new post_controller_1.default();
    router.post("/create", (0, index_middlewares_1.validator)(post_validator_schema_1.default.createPostSchema), (0, index_middlewares_1.DoctorMiddleware)(), (req, res) => {
        return postController.createPost(req, res);
    });
    router.get("/:postId", (0, index_middlewares_1.Auth)(), (req, res) => {
        return postController.getPostById(req, res);
    });
    router.get("/all", (0, index_middlewares_1.Auth)(), (req, res) => {
        return postController.getAllPosts(req, res);
    });
    router.put("/:postId", 
    // validator(validationSchema.updatePostSchema),
    (0, index_middlewares_1.DoctorMiddleware)(), (req, res) => {
        return postController.updatePost(req, res);
    });
    router.delete("/:postId", (0, index_middlewares_1.DoctorMiddleware)(), (req, res) => {
        return postController.deletePost(req, res);
    });
    router.get("/doctor/:doctorId", (0, index_middlewares_1.Auth)(), (req, res) => {
        return postController.getAllPostsByDoctor(req, res);
    });
    router.post("/:postId/comment", (0, index_middlewares_1.validator)(post_validator_schema_1.default.createCommentSchema), (0, index_middlewares_1.Auth)(), (req, res) => {
        return postController.addCommentToPost(req, res);
    });
    router.post("/:postId/like", 
    // validator(validationSchema.addLikeSchema),
    (0, index_middlewares_1.Auth)(), (req, res) => {
        return postController.addLikeToPost(req, res);
    });
    router.delete("/:postId/like", 
    // validator(validationSchema.removeLikeSchema),
    (req, res) => {
        return postController.removeLikeFromPost(req, res);
    });
    return router;
};
exports.default = createPostRoute();
