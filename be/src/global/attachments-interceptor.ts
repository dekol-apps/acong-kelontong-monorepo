import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { applyDecorators, UseInterceptors } from '@nestjs/common';

export function AttachmentsInterceptor(
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
            const baseUrl = req.baseUrl.replace(/^\//, ''); // remove leading slash
            const uuidFolder = uuidv4();
            const relativePath = path.join(baseUrl, fieldName, uuidFolder);
            const fullPath = path.join('./uploads', relativePath);
            fs.mkdirSync(fullPath, { recursive: true });
            cb(null, fullPath);
          },
          filename: (req, file, cb) => {
            cb(null, file.originalname); // keep original filename
          },
        }),
      }),
    ),
  );
}
