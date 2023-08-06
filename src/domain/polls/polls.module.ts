import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@modules/config';
import { CloudinaryModule } from '@modules/cloudinary';
import { RedisTransportModule } from '@modules/cache';
import { UserModule } from '../user/user.module';
import { PollsController } from './controller/polls.controller';
import { PollsService } from './services/polls.service';
import { PollsGateway } from './gateway/polls.gateway';
import { PollEntity } from './entity/poll.entity';
import { PollAccessGuard } from './guards/poll-access.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([PollEntity]),
    ConfigModule,
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async(configService: ConfigService) => ({
        secret: `${configService.get().polls.signing_secret}`,
        signOptions: {
          expiresIn: Number(configService.get().polls.duration),
        }
      }),
      inject: [ConfigService],
    }),
    RedisTransportModule,
    CloudinaryModule,
    forwardRef(() => UserModule),
  ],
  controllers: [PollsController],
  providers: [
    PollsService, 
    PollsGateway,
    PollAccessGuard,
  ],
  exports: [PollsService],
})
export class PollsModule {}
