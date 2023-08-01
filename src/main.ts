import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@modules/config';
import { Logger } from '@modules/logger';
import { AppModule } from './app.module';
import { createDocument } from './docs/main';
import { join } from "path";
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  const reflector = app.get(Reflector);

  const PORT = configService.get().port;

  app.setViewEngine('hbs');
  app.useStaticAssets(join(__dirname, '../client/public/assets'));
  app.setBaseViewsDir(join(__dirname, '../client/views'));

  app.use(compression());
  app.use(cookieParser());
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        'img-src': ["'self'", 'https: data:'],
      },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  createDocument(app);

  await app.listen(PORT, () => {
    logger.http(`[Server]: Server is up and running at port ${PORT}...`);
  });
}

bootstrap();
