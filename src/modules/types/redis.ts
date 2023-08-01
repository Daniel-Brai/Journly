import { ModuleMetadata, FactoryProvider } from "@nestjs/common";
import { Redis,  RedisOptions } from "ioredis";

export const IOREDIS = "IORedis";

export type RedisModuleOptions = {
  connectionOptions: RedisOptions;
  onClientReady?: (client: Redis) => void;
}

export type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
