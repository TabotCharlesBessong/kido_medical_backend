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
const registrationSchema = yup.object({
    firstname: yup.string().lowercase().trim().required(),
    lastname: yup.string().lowercase().trim().required(),
    email: yup.string().email().lowercase().trim().required(),
    password: yup.string().min(6).trim().required()
});
const loginSchema = yup.object({
    email: yup.string().email().lowercase().trim().required(),
    password: yup.string().min(6).trim().required(),
});
const forgotPasswordSchema = yup.object({
    email: yup.string().email().lowercase().trim().required(),
});
const resetPasswordSchema = yup.object({
    code: yup.string().trim().required(),
    email: yup.string().email().lowercase().trim().required(),
    password: yup.string().min(6).trim().required(),
});
const createMessageSchema = yup.object().shape({
    // senderId: yup.string().uuid().required(),
    receiverId: yup.string().uuid().required(),
    content: yup.string().required(),
});
const validationSchema = {
    registrationSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    createMessageSchema
};
exports.default = validationSchema;
