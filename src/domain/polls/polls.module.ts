import { Module } from '@nestjs/common';
import { ConfigModule } from '@modules/config';
import { PollsController } from './controller/polls.controller';
import { PollsService } from './services/polls.service';

@Module({
  imports: [ConfigModule],
  controllers: [PollsController],
  providers: [PollsService],
  exports: [],
})
export class PollsModule {}
