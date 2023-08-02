import { Injectable } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {   
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      v2.uploader.upload_stream(
        {
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(file.buffer)
    })
  }

  async uploadFiles(
    files: Express.Multer.File[],
  ) {
    const urls = await Promise.all(files.map(async (file): Promise<string> => {
      const { secure_url } = await this.uploadFile(file);
      return secure_url;
    }));
    return urls;
  }
}
