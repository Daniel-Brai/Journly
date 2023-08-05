import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import * as fs from 'node:fs';
import { ConfigService } from '@modules/config';
import { SWAGGER_CONFIG } from './swagger.config';

/**
 * Creates an OpenAPI document for an application, via swagger.
 * @param app the nestjs application
 * @returns the OpenAPI document
 */
const SWAGGER_ENVS = ['local', 'development', 'production'];

export function createDocument(app: INestApplication) {
  const builder = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'authorization',
    )
    .setDescription(SWAGGER_CONFIG.description)
    .setExternalDoc('Postman Collection', '/api/docs-json')
    .setVersion(SWAGGER_CONFIG.version);
  for (const tag of SWAGGER_CONFIG.tags) {
    builder.addTag(tag);
  }
  const options = builder.build();
  const env = app.get(ConfigService).get().env;
  const { username, password }: any = app.get(ConfigService).get().swagger;
  if (SWAGGER_ENVS.includes(env)) {
    app.use(
      '/api/docs',
      basicAuth({
        challenge: true,
        users: {
          [username]: password,
        },
      }),
    );
    const document = SwaggerModule.createDocument(app, options);
    const apiEndpoints = Object.keys(document.paths).reduce((acc, path) => {
      if (path.startsWith('/api')) {
        acc[path] = document.paths[path];
      }
      return acc;
    }, {});
    document.paths = apiEndpoints;
    SwaggerModule.setup('api/docs', app, document);
  }
}
