import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@modules/database';
import { ConfigModule } from '@modules/config';
import { LoggerModule } from '@modules/logger';
import { AuthModule } from './auth/auth.module';
import { PollsModule } from './polls/polls.module';

@Module({
  imports: [
    AuthModule,
    PollsModule,
    TypeOrmModule.forFeature([]),
    DatabaseModule.forRoot({
      entities: [],
    }),
    TerminusModule,
    LoggerModule,
    ConfigModule,
  ],

  controllers: [],
  providers: [],
})
export class DomainModule {}