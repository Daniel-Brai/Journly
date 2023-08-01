import { Module } from '@nestjs/common';
import { ConfigModule } from '@modules/config';
import { RedisTransportModule } from "@modules/cache";
import { PollsController } from './controller/polls.controller';
import { PollsService } from './service/polls.service';

@Module({
  imports: [ConfigModule, RedisTransportModule],
  controllers: [PollsController],
  providers: [PollsService],
  exports: [],
})
export class PollsModule {}
