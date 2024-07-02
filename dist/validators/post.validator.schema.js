"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const yup = __importStar(require("yup"));
const createPostSchema = yup.object().shape({
    // doctorId: yup.string().required(),
    title: yup.string().required(),
    image: yup.string().optional(),
    description: yup.string().required(),
});
const updatePostSchema = yup.object().shape({
    title: yup.string().optional(),
    image: yup.string().optional(),
    description: yup.string().optional(),
    status: yup.string().optional(),
});
const createCommentSchema = yup.object().shape({
    // postId: yup.string().required(),
    // userId: yup.string().required(),
    content: yup.string().required(),
});
const validationSchema = { createPostSchema, updatePostSchema, createCommentSchema };
exports.default = validationSchema;
