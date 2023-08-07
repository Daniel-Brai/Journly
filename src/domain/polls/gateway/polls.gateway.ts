import { Logger, UsePipes, UseFilters, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { PollsService } from '../services/polls.service';
import {
  WsExceptionFilter,
  SocketAuth,
  POLL_UPDATED,
} from '@modules/websockets';

@UsePipes(new ValidationPipe())
@UseFilters(new WsExceptionFilter())
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

  async handleConnection(client: SocketAuth) {
    const sockets = this.io.sockets;

    this.logger.log(`Websocket Client with ${client.id} connected...`);
    this.logger.debug(`Number of connected sockets are: ${sockets.size}...`);

    const roomName = client.pollId;
    await client.join(roomName);

    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.debug(
      `A user wid id: ${client.participantId} joined a poll created by ${client.adminId} with the room name: ${roomName}`,
    );
    this.logger.debug(
      `Total clients connected to the room '${roomName}': ${connectedClients}`,
    );

    const updatedPoll = await this.pollsService.addParticipant({
      id: client.pollId,
      participant_id: client.participantId,
    });
    this.io.to(roomName).emit(POLL_UPDATED, updatedPoll);
  }

  async handleDisconnect(client: SocketAuth) {
    const sockets = this.io.sockets;

    const roomName = client.pollId;
    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    const dto = {
      id: client.pollId,
      participant_id: client.participantId,
    };
    const updatedPoll = await this.pollsService.leavePoll(dto);
    this.logger.log(`Websocket Client with ${client.id} disconnected...`);
    this.logger.debug(`Number of connected sockets are: ${sockets.size}...`);
    this.logger.debug(
      `Total clients connected to the room '${roomName}': ${connectedClients}`,
    );

    if (updatedPoll) {
      this.io.to(roomName).emit(POLL_UPDATED, updatedPoll);
    }
  }
}
