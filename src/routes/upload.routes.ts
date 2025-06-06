import { Router } from 'express';
import UploadController from '../controllers/upload.controller';
import UploadService from '../services/upload.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/upload',
  authenticate,
  UploadService.getUploadMiddleware(),
  UploadController.uploadFile
);

export default router; 