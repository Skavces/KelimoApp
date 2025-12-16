import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  uploadImage(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
            folder: 'kelime-uygulamasi-avatars', // Cloudinary'de bu klasöre kaydeder
            transformation: [{ width: 300, height: 300, crop: 'fill' }] // Otomatik boyutlandırma (isteğe bağlı)
        }, 
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      // Dosya buffer'ını stream'e çevirip Cloudinary'ye yolluyoruz
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}