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
const post_datasource_1 = __importDefault(require("../datasources/post.datasource"));
const comment_datasource_1 = __importDefault(require("../datasources/comment.datasource"));
const like_datasource_1 = __importDefault(require("../datasources/like.datasource"));
class PostService {
    constructor() {
        this.postDataSource = new post_datasource_1.default();
        this.commentDataSource = new comment_datasource_1.default();
        this.likeDataSource = new like_datasource_1.default();
    }
    createPost(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.postDataSource.create(data);
        });
    }
    getPostById(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.postDataSource.fetchOne({ where: { id: postId } });
        });
    }
    updatePost(postId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.postDataSource.updateOne({ where: { id: postId } }, data);
        });
    }
    deletePost(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.postDataSource.deleteOne({ where: { id: postId } });
        });
    }
    getAllPostsByDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.postDataSource.fetchAllByDoctorId(doctorId);
        });
    }
    addCommentToPost(postId, userId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.commentDataSource.create({ postId, userId, content });
        });
    }
    addLikeToPost(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.likeDataSource.create({ postId, userId });
            const post = yield this.getPostById(postId);
            if (post) {
                yield this.updatePost(postId, { likesCount: post.likesCount + 1 });
            }
        });
    }
    removeLikeFromPost(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.likeDataSource.deleteOne({ where: { postId, userId } });
            const post = yield this.getPostById(postId);
            if (post) {
                yield this.updatePost(postId, { likesCount: post.likesCount - 1 });
            }
        });
    }
    getPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.postDataSource.fetchAllPost(query);
        });
    }
}
exports.default = PostService;
