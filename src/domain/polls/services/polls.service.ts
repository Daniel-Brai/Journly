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
import { 
  IOREDIS, 
  Nominations, 
  RankingScore, 
  Rankings, 
  Results 
} from '@modules/types';
import { createRandomString } from '@modules/utils';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import {
  AddNominationDto,
  AddRankingsDataDto,
  AddResultsDto,
  CreatePollDto,
  InviteToPollDto,
  JoinPollDto,
  LeavePollDto,
  RemoveNominationDto,
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
    this.ttl = configService.get().polls.duration;
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
      const signature = await this.jwtService.signAsync(data, {
        secret: this.configService.get().polls.signing_secret,
        expiresIn: this.configService.get().polls.duration,
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

  public async addNomination(
    id: string,
    body: AddNominationDto,
  ): Promise<GenericPollMessageResponseDto> {
    const nominationId = createRandomString();
    const pollKey = `polls:${id}`;
    const nominationPath = `.nominations.${nominationId}`;

    const foundUser = await this.userService.findOneByUserId(
      body.participant_id,
    );

    try {
      await this.redisClient.call(
        'JSON.SET',
        pollKey,
        nominationPath,
        JSON.stringify(body),
      );

      const updatedPoll = await this.findOneUsingRedis(id);
      return {
        message: `@${foundUser.name} just nominated!`,
        data: updatedPoll,
      };
    } catch (error) {
      this.logger.error(
        `Failed to remove participant: @${foundUser.name} from poll with id ${id}`,
      );
      throw new InternalServerErrorException(error);
    }
  }

  public async removeNomination(
    id: string,
    body: RemoveNominationDto,
  ): Promise<PollEntity> {
    const pollKey = `polls:${id}`;
    const nominationPath = `.nominations.${body.nomination_id}`;

    try {
      await this.redisClient.call('JSON.DEL', pollKey, nominationPath);

      const updatedPoll = await this.findOneUsingRedis(id);
      return updatedPoll;
    } catch (error) {
      this.logger.error(
        `Failed to remove nomination with id: ${body.nomination_id} from poll with id ${id}`,
      );
      throw new InternalServerErrorException(error);
    }
  }

  public async startPoll(id: string): Promise<GenericPollMessageResponseDto> {
    const pollKey = `polls:${id}`;
    const hasStartedPath = '.has_started';

    try {
      await this.redisClient.call(
        'JSON.SET',
        pollKey,
        hasStartedPath,
        JSON.stringify(true),
      );
      const updatedPoll = await this.findOneUsingRedis(id);
      return {
        message: 'The poll has been started by the admin',
        data: updatedPoll,
      };
    } catch (error) {
      this.logger.error(`Failed to start the poll with id ${id}`);
      throw new InternalServerErrorException(error);
    }
  }

  public async addRankings(
    id: string,
    body: AddRankingsDataDto,
  ): Promise<GenericPollMessageResponseDto> {
    const pollKey = `polls:${id}`;
    const rankingsPath = `.rankings.${body.participant_id}`;

    try {
      await this.redisClient.call(
        'JSON.SET',
        pollKey,
        rankingsPath,
        JSON.stringify(body.rankings),
      );
      const foundUser = await this.userService.findOneByUserId(
        body.participant_id,
      );
      const updatedPoll = await this.findOneUsingRedis(id);
      return {
        message: `@${foundUser.name} just ranked a nomination`,
        data: updatedPoll,
      };
    } catch (error) {
      this.logger.error(`Failed to add ranking to the poll with id ${id}`);
      throw new InternalServerErrorException(error);
    }
  }

  public async submitRankings(
    id: string,
    body: AddRankingsDataDto,
  ): Promise<GenericPollMessageResponseDto> {
    const poll = await this.findOneUsingRedis(id);

    if (!poll) {
      throw new BadRequestException(
        `Rankings cannot be added before the poll is created or started`,
      );
    }
    return await this.addRankings(id, body);
  }

  public async addResults(
    id: string, 
    body: AddResultsDto
  ): Promise<GenericPollMessageResponseDto> {
    this.logger.log(`Attempting to add results to the poll with id: ${id}`);

    const pollKey = `polls:${id}`;
    const resultsPath = '.results';

    try {
      await this.redisClient.call(
        'JSON.SET',
        pollKey,
        resultsPath,
        JSON.stringify(body.results),
      )
      const updatedPoll = await this.findOneUsingRedis(id);
      return {
        message: `Results for poll: "${updatedPoll.topic}" have been updated`,
        data: updatedPoll,
      }
    } catch(error) {
      this.logger.error(`Failed to add results to poll with id ${id}`);
      throw new BadRequestException(error);
    }
  }

  public async getResults(id: string): Promise<Results> {
    const scores: RankingScore = {};
    const poll = await this.findOneUsingRedis(id);

    Object.values(poll.rankings).forEach((r) => {
      r.forEach((id, n) => {
        const votingPower = Math.pow(
          (poll.votes_per_participant - 0.5 * n) / poll.votes_per_participant,
          n + 1,
        );

        scores[id] = (scores[id] ?? 0) + votingPower;
      })
    })

    const results = Object.entries(scores).map(([nomination_id, score]) => ({
      nomination_id,
      nomination_description: poll.nominations[nomination_id].description,
      score,
    }));

    results.sort((r1, r2) => r2.score - r1.score);

    return results;
  }

  public async deletePoll(id: string) {
    this.logger.debug(`Attempting to delete the poll with id ${id}`)

    const pollKey = `polls:${id}`;

    try {
      await this.redisClient.call('JSON.DEL', pollKey);
    } catch(error) {
      this.logger.log(`Failed to delete poll with id ${id}`);
      throw new InternalServerErrorException(error);
    }
  }

  public async tallyResults(id: string) {
    const poll = await this.findOneUsingRedis(id);
    
    const results = await this.getResults(poll.id);
    return await this.addResults(poll.id, { results: results })
  }
}
