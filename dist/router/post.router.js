"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    router.post("/create", (0, index_middlewares_1.validator)(post_validator_schema_1.default.createPostSchema), (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield postController.createPost(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/:postId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield postController.getPostById(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/post/all", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield postController.getAllPosts(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.put("/:postId", (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield postController.updatePost(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.delete("/:postId", (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield postController.deletePost(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/doctor/:doctorId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield postController.getAllPostsByDoctor(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/:postId/comment", (0, index_middlewares_1.validator)(post_validator_schema_1.default.createCommentSchema), (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield postController.addCommentToPost(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/:postId/like", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield postController.addLikeToPost(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.delete("/:postId/like", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield postController.removeLikeFromPost(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
};
exports.default = createPostRoute();
