import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@modules/config';
import { Logger } from '@modules/logger';
import { SocketIOAdapter } from '@modules/websockets';
import { AppModule } from './app.module';
import { createDocument } from './docs/main';
import { join } from 'path';
import { Request, NextFunction } from 'express';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  const reflector = app.get(Reflector);

  const PORT = Number(configService.get().port);

  app.enableCors({
    origin: [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`],
  });

  app.useWebSocketAdapter(new SocketIOAdapter(app, configService));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
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

  app.useStaticAssets(join(__dirname, '../client/public/assets'));
  app.setBaseViewsDir(join(__dirname, '../client/views'));
  app.setViewEngine('hbs');

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
  app.use((req: Request, _: any, next: NextFunction) => {
    logger.info(
      `[Server]: The url invoked is: '${req.originalUrl}' from ip address: ${req.ip}`,
    );
    next();
  });

  createDocument(app);

  await app.listen(PORT, () => {
    logger.log(`[Server]: Server is up and running at port ${PORT}...`);
  });
}

bootstrap();
