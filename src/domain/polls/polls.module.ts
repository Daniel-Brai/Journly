import { Module } from '@nestjs/common';
import { ConfigModule } from '@modules/config';
import { RedisTransportModule } from '@modules/cache';
import { UserModule } from '../user/user.module';
import { PollsController } from './controller/polls.controller';
import { PollsService } from './services/polls.service';

@Module({
  imports: [ConfigModule, RedisTransportModule, UserModule],
  controllers: [PollsController],
  providers: [PollsService],
  exports: [],
})
export class PollsModule {}
