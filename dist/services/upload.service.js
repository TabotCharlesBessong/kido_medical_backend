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
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Configure storage
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'kido_medical',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        resource_type: 'auto'
    } // Type assertion to bypass strict type checking
});
// Configure multer
const upload = (0, multer_1.default)({ storage: storage });
class UploadService {
    constructor() {
        this.upload = upload;
    }
    getUploadMiddleware() {
        return this.upload.single('file');
    }
    uploadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield cloudinary_1.v2.uploader.upload(file.path);
                return result.secure_url;
            }
            catch (error) {
                console.error('Error uploading file to Cloudinary:', error);
                throw new Error('Failed to upload file');
            }
        });
    }
    deleteFile(publicId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cloudinary_1.v2.uploader.destroy(publicId);
            }
            catch (error) {
                console.error('Error deleting file from Cloudinary:', error);
                throw new Error('Failed to delete file');
            }
        });
    }
}
exports.default = new UploadService();
