import { ConfigData } from './config.interface';

export const DEFAULT_CONFIG: ConfigData = {
  port: Number(process.env.PORT || 8000),
  env: 'production',
  database: {
    host: '',
    port: 5432,
    username: '',
    password: '',
    name: '',
    url: '',
  },
  redis: {
    host: '',
    port: 6379,
  },
  auth: {
    expiresIn: 30000,
    access_token_secret: '',
    refresh_token_secret: '',
  },
  google: {
    oauth_google_id: '',
    oauth_google_callback: '',
    oauth_google_secret: '',
  },
  github: {
    oauth_github_id: '',
    oauth_github_callback: '',
    oauth_github_secret: '',
  },
  swagger: {
    username: '',
    password: '',
  },
  logLevel: '',
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    cloud_api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_secret_key: process.env.CLOUDINARY_API_SECRET_KEY!,
  },
  polls: {
    duration: 30000,
    signing_secret: '',
  },
};
