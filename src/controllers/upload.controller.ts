import { Request, Response } from 'express';
import UploadService from '../services/upload.service';
import { ResponseCode } from '../interfaces/enum/code.enum';
import Utility from '../utils/index.utils';

class UploadController {
  private uploadService: typeof UploadService;

  constructor() {
    this.uploadService = UploadService;
  }

  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return Utility.handleError(
          res,
          'No file uploaded',
          ResponseCode.BAD_REQUEST
        );
      }

      const fileUrl = await this.uploadService.uploadFile(req.file);
      
      return Utility.handleSuccess(
        res,
        'File uploaded successfully',
        { fileUrl },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as Error).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }
}

export default new UploadController(); 