import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@modules/config';
import { CloudinaryModule } from '@modules/cloudinary';
import { RedisTransportModule } from '@modules/cache';
import { UserModule } from '../user/user.module';
import { PollsController } from './controller/polls.controller';
import { PollsService } from './services/polls.service';
import { PollsGateway } from './gateway/polls.gateway';
import { PollEntity } from './entity/poll.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PollEntity]),
    ConfigModule, 
    RedisTransportModule, 
    CloudinaryModule,
    forwardRef(() => UserModule),
  ],
  controllers: [PollsController],
  providers: [PollsService, PollsGateway],
  exports: [PollsService],
})
export class PollsModule {}
