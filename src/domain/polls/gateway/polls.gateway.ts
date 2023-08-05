import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { PollsService } from '../services/polls.service';

@WebSocketGateway({ namespace: 'polls' })
export class PollsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PollsGateway.name);

  constructor(private readonly pollsService: PollsService) {}

  @WebSocketServer()
  io: Namespace;

  afterInit(): void {
    this.logger.log('Websocket Gateway Initialized...');
  }

  handleConnection(client: Socket, ...args: any[]) {
    const sockets = this.io.sockets;

    this.logger.log(`Websocket Client with ${client.id} connected...`);
    this.logger.debug(`Number of connected sockets are: ${sockets.size}...`);
  }

  handleDisconnect(client: Socket) {
    const sockets = this.io.sockets;

    this.logger.log(`Websocket Client with ${client.id} disconnected...`);
    this.logger.debug(`Number of connected sockets are: ${sockets.size}...`);
  }
}
