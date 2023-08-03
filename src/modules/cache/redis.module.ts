import { DynamicModule, Module } from '@nestjs/common';
import { IOREDIS, RedisAsyncModuleOptions } from '@modules/types';
import IORedis from 'ioredis';

@Module({})
export class RedisModule {
  static async registerAsync({
    useFactory,
    imports,
    inject,
  }: RedisAsyncModuleOptions): Promise<DynamicModule> {
    const RedisProvider = {
      provide: IOREDIS,
      useFactory: async (...args: any) => {
        const { connectionOptions, onClientReady } = await useFactory(...args);
        const client = new IORedis(connectionOptions);
        onClientReady(client);
        return client;
      },
      inject,
    };

    return {
      module: RedisModule,
      imports,
      providers: [RedisProvider],
      exports: [RedisProvider],
    };
  }
}
