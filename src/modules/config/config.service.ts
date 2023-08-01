import { Injectable } from '@nestjs/common';
import { DEFAULT_CONFIG } from './config.default';
import { ConfigData, ConfigDatabase, ConfigSwagger } from './config.interface';

@Injectable()
export class ConfigService {
  private config: ConfigData;
  constructor(data: ConfigData = DEFAULT_CONFIG) {
    this.config = data;
  }

  public loadFromEnv() {
    this.config = this.parseConfigFromEnv(process.env);
  }

  private parseConfigFromEnv(env: NodeJS.ProcessEnv): ConfigData {
    return {
      env: env.NODE_ENV || DEFAULT_CONFIG.env,
      port: parseInt(env.PORT!, 10),
      database: this.parseDBConfig(env, DEFAULT_CONFIG.database),
      swagger: this.parseSwaggerConfig(env, DEFAULT_CONFIG.swagger),
      logLevel: env.LOG_LEVEL!,
      auth: {
        expiresIn: Number(env.TOKEN_EXPIRY),
        access_token_secret: env.JWT_ACCESS_TOKEN_SECRET!,
        refresh_token_secret: env.JWT_REFRESH_TOKEN_SECRET!,
      },
      google: {
        oauth_google_id: env.OAUTH_GOOGLE_ID!,
        oauth_google_callback: env.OAUTH_GOOGLE_REDIRECT_URL!,
        oauth_google_secret: env.OAUTH_GOOGLE_SECRET!,
      },
      github: {
        oauth_github_id: env.OAUTH_GITHUB_ID!,
        oauth_github_callback: env.OAUTH_GITHUB_REDIRECT_URL!,
        oauth_github_secret: env.OAUTH_GITHUB_SECRET!,
      },
    };
  }

  private parseDBConfig(
    env: NodeJS.ProcessEnv,
    defaultConfig: Readonly<ConfigDatabase>,
  ) {
    return {
      host: env.DATABASE_HOST || defaultConfig.host,
      port: Number(env.DATABASE_PORT) || defaultConfig.port,
      username: env.DATABASE_USERNAME || defaultConfig.username,
      password: env.DATABASE_PASSWORD || defaultConfig.password,
      name: env.DATABASE_NAME || defaultConfig.name,
      url: env.DATABASE_URL || defaultConfig.url,
    };
  }

  private parseSwaggerConfig(
    env: NodeJS.ProcessEnv,
    defaultConfig: Readonly<ConfigSwagger>,
  ) {
    return {
      username: env.SWAGGER_USERNAME || defaultConfig.username,
      password: env.SWAGGER_PASSWORD || defaultConfig.password,
    };
  }

  public get(): Readonly<ConfigData> {
    return this.config;
  }
}
