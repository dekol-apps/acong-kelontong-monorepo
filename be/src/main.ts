import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SanitizePipe } from './global/sanitizer.pipe';
import { ErrResFactory } from './global/err-res-factory';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Types } from 'mongoose';

// Map Decimal128 to its string equivalent during JSON serialization
Types.Decimal128.prototype.toJSON = function () {
  return this.toString();
};

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());

  // Serve /uploads folder as static
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // set global prefix
  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.OPTIONS }],
  });

  app.enableCors({
    origin: process.env.FE_DOMAIN as string, // FE domain
    credentials: true,                    // allow cookies
    methods: ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new SanitizePipe(), new ValidationPipe({ transform: true, whitelist: true }));
  // whitelist: true, will automatically remove any properties that are not defined in the DTO, make sure every controller has DTO
  app.useGlobalFilters(new ErrResFactory());

  await app.listen(process.env.BE_PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
