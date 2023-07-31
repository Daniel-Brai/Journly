export interface ConfigDatabase {
  url: string;
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

export interface UserServiceConfigOptions {
  host: string;
  port: number;
}

export interface ConfigData {
  env: string;

  port: number;

  database: ConfigDatabase;

  swagger: ConfigSwagger;

  logLevel: string;

  auth: AuthConfig;

  google: GoogleConfig;

  github: GithubConfig;
}
