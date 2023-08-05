import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from '@modules/database';
import { ConfigModule } from '@modules/config';
import { LoggerModule } from '@modules/logger';
import { RedisTransportModule } from '@modules/cache';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PollsModule } from './polls/polls.module';
import { UserEntity } from './user/entity/user.entity';
import { PollEntity } from './polls/entity/poll.entity';

@Module({
  imports: [
    DatabaseModule.forRoot({
      entities: [UserEntity, PollEntity],
    }),
    RedisTransportModule,
    UserModule,
    AuthModule,
    PollsModule,
    TerminusModule,
    LoggerModule,
    ConfigModule,
  ],

  controllers: [],
  providers: [],
})
export class DomainModule {}
