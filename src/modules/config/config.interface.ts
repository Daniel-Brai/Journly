export interface ConfigDatabase {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  url: string;
}

export interface ConfigRedis {
  host: string;
  port: number;
}

export interface ConfigSwagger {
  username: string;
  password: string;
}

export interface AuthConfig {
  expiresIn: number;
  access_token_secret: string;
  refresh_token_secret: string;
}

export interface UserServiceConfig {
  options: UserServiceConfigOptions;
  transport: any;
}

export interface GithubConfig {
  oauth_github_id: string;
  oauth_github_callback: string;
  oauth_github_secret: string;
}

export interface GoogleConfig {
  oauth_google_id: string;
  oauth_google_callback: string;
  oauth_google_secret: string;
}

export interface CloudinaryConfig {
  cloud_name: string;
  cloud_api_key: string;
  cloud_secret_key: string;
}

export interface UserServiceConfigOptions {
  host: string;
  port: number;
}

export interface PollsConfig {
  duration: number;
  signing_secret: string;
}

export interface ConfigData {
  env: string;

  port: number;

  database: ConfigDatabase;

  redis: ConfigRedis;

  swagger: ConfigSwagger;

  logLevel: string;

  polls: PollsConfig;

  cloudinary: CloudinaryConfig;

  auth: AuthConfig;

  google: GoogleConfig;

  github: GithubConfig;
}
