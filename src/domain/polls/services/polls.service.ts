import { 
  BadRequestException, 
  Inject, 
  Injectable, 
  InternalServerErrorException, 
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@modules/config';
import { IOREDIS, Poll } from '@modules/types';
import { Repository } from "typeorm";
import { Redis } from 'ioredis';
import { CreatePollDto, JoinPollDto, RejoinPollDto } from '../dto/poll-request.dto';
import { PollEntity } from '../entity/poll.entity';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class PollsService {
  private readonly ttl: number;
  private readonly logger = new Logger(PollsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @Inject(IOREDIS) private readonly redisClient: Redis,
    @InjectRepository(PollEntity) private pollRepository: Repository<PollEntity>,
  ) {
    this.ttl = Number(`${configService.get().polls.duration}`);
  }

  public async create(poll: CreatePollDto): Promise<PollEntity> {
    try {
      let newPoll = this.pollRepository.create(poll);
      const savedPoll = await this.pollRepository.save(newPoll);
      
      this.logger.log(`Saved poll to database: ${JSON.stringify(savedPoll, null, 2)}...`);

      const { id } = savedPoll;
      const pollKey = `polls:${id}`;

      try {
        await this.redisClient.multi([
          ['JSON.SET', pollKey, '.', JSON.stringify(savedPoll)],
          ['EX', pollKey, this.ttl]
        ]).exec();

        this.logger.log(`Saved poll to Redis: ${JSON.stringify(savedPoll, null, 2)} with TTL of ${this.ttl} seconds...`);
      } catch(error) {
        this.logger.error(`Failed to save poll with error: ${error}`);
        throw new InternalServerErrorException();
      }

      return savedPoll
    } catch (error) {
      this.logger.error(`Failed to save poll to database with error: ${error}`);
      throw new InternalServerErrorException();
    }
  }

  public async findOneById(id: string): Promise<PollEntity> {
    const foundPoll = await this.pollRepository.findOne({
      where: { id: id },
    })

    if (!foundPoll) throw new NotFoundException();
    return foundPoll;
  }

  public async findOneUsingRedis(id: string): Promise<PollEntity> {
    const foundPoll = await this.findOneById(id);
    const pollKey =  `polls:${foundPoll.id}`;

    try {
      const stringifiedPoll = await this.redisClient.call(
        'JSON.GET',
        pollKey,
        '.',
      );
      const poll: PollEntity = JSON.parse(stringifiedPoll as string);
      this.logger.log(`The current poll is ${poll}`);
      return poll;
    } catch(error) {
      this.logger.error(`Failed to fetch poll from redis with error: ${error}`);
      throw new InternalServerErrorException();
    }
  }

  public async addParticipant(email: string, id: string) {
    // first, find a user by their email
    const foundUser = await this.userService.findOneByEmail(email);
    if (!foundUser) {
      // TODO: we create the user and email the participate their credentials to login and change afterward.
    }

    const pollKey = `polls:${id}`;
    const participantPath = `.participants.${foundUser.id}`;

    try {
      await this.redisClient.call('JSON.SET', pollKey, participantPath, JSON.stringify(foundUser.name))
    }
    catch(error ) {}
  }
  public async join(id: string) {}
  public async rejoin() {}
}
