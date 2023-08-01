import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from "@modules/config";
import { Logger } from "@modules/logger";
import { AppModule } from "./app.module";
import { createDocument } from "./docs/main";
import * as compression from "compression";
import helmet from 'helmet';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  
  const globalPrefix = "api/v1";
  const PORT = configService.get().port;

  app.setGlobalPrefix(globalPrefix);

  app.use(compression())
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

  createDocument(app);
  await app.listen(PORT, () => {
    logger.http(`[Server]: Server is up and running at port ${PORT}...`);
  });
}

bootstrap();

