import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

const ConfigFactory = {
  provide: ConfigService,
  useFactory: () => {
    const config = new ConfigService();
    config.loadFromEnv();
    return config;
  },
};

@Module({
  imports: [],
  controllers: [],
  providers: [ConfigFactory],
  exports: [ConfigFactory],
})
export class ConfigModule {}
