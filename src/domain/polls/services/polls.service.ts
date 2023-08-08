import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@modules/config';
import { IOREDIS, Poll } from '@modules/types';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import {
  CreatePollDto,
  InviteToPollDto,
  JoinPollDto,
  LeavePollDto,
  RejoinPollDto,
} from '../dto/poll-request.dto';
import { GenericPollMessageResponseDto } from '../dto/poll-response.dto';
import { PollEntity } from '../entity/poll.entity';
import { UserService } from '../../user/services/user.service';
import { UserEntity } from '../../user/entity/user.entity';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class PollsService {
  private readonly ttl: number;
  private readonly logger = new Logger(PollsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @Inject(IOREDIS)
    private readonly redisClient: Redis,
    @InjectRepository(PollEntity)
    private pollRepository: Repository<PollEntity>,
  ) {
    this.ttl = Number(`${configService.get().polls.duration}`);
  }

  public async create(
    user: UserEntity,
    poll: CreatePollDto,
  ): Promise<PollEntity> {
    try {
      const newPoll = this.pollRepository.create(poll);
      const data: JwtPayload = {
        pollId: newPoll.id,
        pollName: newPoll.topic,
        participantId: '',
      };
      const signature = this.jwtService.sign(data, {
        subject: user.id,
      });
      newPoll.signature = signature;
      const savedPoll = await this.pollRepository.save(newPoll);

      this.logger.log(
        `Saved poll to database: ${JSON.stringify(savedPoll, null, 2)}...`,
      );

      const { id } = savedPoll;
      const pollKey = `polls:${id}`;

      try {
        await this.redisClient
          .multi([
            ['JSON.SET', pollKey, '.', JSON.stringify(savedPoll)],
            ['EX', pollKey, this.ttl],
          ])
          .exec();

        this.logger.log(
          `Saved poll to Redis: ${JSON.stringify(
            savedPoll,
            null,
            2,
          )} with TTL of ${this.ttl} seconds...`,
        );
      } catch (error) {
        this.logger.error(`Failed to save poll with error: ${error}`);
        throw new InternalServerErrorException();
      }

      return savedPoll;
    } catch (error) {
      this.logger.error(`Failed to save poll to database with error: ${error}`);
      throw new InternalServerErrorException();
    }
  }

  public async findOneById(id: string): Promise<PollEntity> {
    const foundPoll = await this.pollRepository.findOne({
      where: { id: id },
    });

    if (!foundPoll) throw new NotFoundException();
    return foundPoll;
  }

  public async findOneUsingRedis(id: string): Promise<PollEntity> {
    const pollKey = `polls:${id}`;

    try {
      const stringifiedPoll = (await this.redisClient.call(
        'JSON.GET',
        pollKey,
        '.',
      )) as string;
      const poll = JSON.parse(stringifiedPoll) as PollEntity;
      this.logger.log(`The current poll is ${poll}`);
      return poll;
    } catch (error) {
      this.logger.error(`Failed to fetch poll from redis with error: ${error}`);
      throw new InternalServerErrorException();
    }
  }

  public async addParticipant(
    id: string,
    body: JoinPollDto,
  ): Promise<GenericPollMessageResponseDto> {
    const { participant_id } = body;
    const foundUser = await this.userService.findOneByUserId(participant_id);
    if (!foundUser) throw new NotFoundException();

    const participantPath = `.participants.${foundUser.id}`;

    try {
      const foundPoll = await this.findOneUsingRedis(id);
      const pollKey = `polls:${foundPoll.id}`;
      await this.redisClient.call(
        'JSON.SET',
        pollKey,
        participantPath,
        JSON.stringify(foundUser.name),
      );
      const updatedPoll = await this.findOneUsingRedis(id);
      this.logger.debug(
        `Current participants for poll with id ${id} are:`,
        updatedPoll.participants,
      );
      return {
        message: `@${foundUser.name} joined your poll`,
        data: updatedPoll,
      };
    } catch (error) {
      this.logger.error(
        `Failed to add participant: @${foundUser.name} to poll with id ${id}`,
      );
      throw new BadRequestException(error);
    }
  }

  public async inviteParticipant(id: string, body: InviteToPollDto) {
    const { username, email } = body;
    if (username === null && email === null) {
      throw new BadRequestException(
        'One of the fields must be filled in to invite a user',
      );
    }
    if (username !== null && email !== null) {
      throw new BadRequestException('You can fill in both fields');
    }
    if (username) {
      const user = await this.userService.findOneByUsername(username);
      return await this.addParticipant(id, { participant_id: user.id });
    }
    if (email) {
      return await this.userService.invite(email);
    }
  }

  public async removeParticipant(
    admin_id: string,
    poll_id: string,
    body: LeavePollDto,
  ) {
    const poll = await this.findOneUsingRedis(poll_id);

    if (admin_id !== poll.created_by.id) {
      throw new UnauthorizedException();
    }

    if (!poll.has_started) {
      return await this.leavePoll(poll_id, body);
    }
  }

  public async leavePoll(
    id: string,
    body: LeavePollDto,
  ): Promise<GenericPollMessageResponseDto> {
    const { participant_id } = body;
    const pollKey = `polls:${id}`;
    const participantPath = `.participants.${participant_id}`;

    const foundUser = await this.userService.findOneByUserId(participant_id);
    try {
      await this.redisClient.call('JSON.DEL', pollKey, participantPath);
      const updatedPoll = await this.findOneUsingRedis(id);
      this.logger.debug(
        `Current participants for poll with id ${id} are:`,
        updatedPoll.participants,
      );
      return {
        message: `@${foundUser.name} left the poll`,
        data: updatedPoll,
      };
    } catch (error) {
      this.logger.error(
        `Failed to remove participant: @${foundUser.name} from poll with id ${id}`,
      );
      throw new BadRequestException(error);
    }
  }
}
