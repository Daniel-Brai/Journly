import { Logger } from "@nestjs/common";
import { ConfigService, ConfigModule } from "@modules/config";
import { RedisModule } from "@modules/cache";

export const RedisTransportModule = RedisModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const logger = new Logger('RedisTransportModule');

    return {
      connectionOptions: {
        host: configService.get().redis.host,
        port: configService.get().redis.port,
      },
      onClientReady: (client) => {
        logger.log('Redis CLient initialized...');

        client.on('error', (err) => {
          logger.error(`Redis Client initialization failed: ${err.message}`);
        });

        client.on('connect', () => {
          logger.log(`Redis Client initializion successful on ${client.options.host}:${client.options.port}...`);
        });
      },
    };
  },
  inject: [ConfigService],
});
