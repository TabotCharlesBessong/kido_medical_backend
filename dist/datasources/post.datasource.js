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
const post_model_1 = __importDefault(require("../models/post.model"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const like_model_1 = __importDefault(require("../models/like.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const doctor_model_1 = __importDefault(require("../models/doctor.model"));
class PostDataSource {
    create(record) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield post_model_1.default.create(record);
        });
    }
    fetchOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield post_model_1.default.findOne(Object.assign(Object.assign({}, query), { include: [
                    { model: comment_model_1.default, as: "postComments" },
                    {
                        model: like_model_1.default,
                        as: "postLikes",
                        include: [{ model: user_model_1.default, as: "likeUser" }],
                    },
                    {
                        model: doctor_model_1.default,
                        as: "postDoctor",
                    },
                ] }));
        });
    }
    updateOne(searchBy, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield post_model_1.default.update(data, searchBy);
        });
    }
    deleteOne(searchBy) {
        return __awaiter(this, void 0, void 0, function* () {
            yield post_model_1.default.destroy(searchBy);
        });
    }
    fetchAllByDoctorId(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield post_model_1.default.findAll({
                where: { doctorId },
                include: [
                    { model: comment_model_1.default, as: "postComments" },
                    {
                        model: like_model_1.default,
                        as: "postLikes",
                        include: [{ model: user_model_1.default, as: "likeUser" }],
                    },
                ],
            });
        });
    }
    fetchAllPost(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield post_model_1.default.findAll({
                include: [
                    { model: comment_model_1.default, as: "postComments" },
                    {
                        model: like_model_1.default,
                        as: "postLikes",
                        include: [{ model: user_model_1.default, as: "likeUser" }],
                    },
                ],
            });
        });
    }
}
exports.default = PostDataSource;
