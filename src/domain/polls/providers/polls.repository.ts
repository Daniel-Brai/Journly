import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@modules/config";
import { IOREDIS } from "@modules/types";
import { Redis } from "ioredis";

@Injectable()
export class PollsProvider {
  private readonly ttl: string;
  private readonly logger = new Logger(PollsProvider.name);

  constructor( 
    configService: ConfigService,
    @Inject(IOREDIS)
    private readonly redisClient: Redis,
  ) {
    this.ttl = `${configService.get().polls.duration}`;
  }
}
