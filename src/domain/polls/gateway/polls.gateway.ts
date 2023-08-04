import { Logger } from '@nestjs/common';
import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { PollsService } from '../services/polls.service';

@WebSocketGateway({ namespace: 'polls' })
export class PollsGateway implements OnGatewayInit {
  private readonly logger = new Logger(PollsGateway.name);

  constructor( 
    private readonly pollsService: PollsService,
  ) {}

  afterInit(): void {
    this.logger.log('Websocket Gateway Initialized...');
  }
}
