import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { applyDecorators, UseInterceptors } from '@nestjs/common';

export function UploadinvestmentInterceptor(
  fieldName = 'attachments',
  maxCount = 10,
) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, {
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only images allowed'), false);
          }
          cb(null, true);
        },
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uuidFolder = uuidv4();
            const uploadPath = path.join('./uploads/investment', uuidFolder);

            fs.mkdirSync(uploadPath, { recursive: true });

            (req as any).uuidFolder = uuidFolder;
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${file.originalname}${ext}`); // keep original filename
          },
        }),
      }),
    ),
  );
}
