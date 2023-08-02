import { ConfigService } from '@modules/config';
import { CLOUDINARY } from '@modules/types';
import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    return v2.config({
      cloud_name: `${configService.get().cloudinary.cloud_name}`,
      api_key: `${configService.get().cloudinary.cloud_api_key}`,
      api_secret: `${configService.get().cloudinary.cloud_secret_key}`,
    });
  },
  inject: [ConfigService],
};
