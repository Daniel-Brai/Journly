import {
  Logger,
  UseGuards,
  UsePipes,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { PollsService } from '../services/polls.service';
import {
  WsExceptionFilter,
  SocketAuth,
  POLL_UPDATED,
  POLL_REMOVE_PARTICIPANT,
  POLL_PARTICIPANT_ADD_NOMINATION,
  POLL_PARTICIPANT_DEL_NOMINATION,
  POLL_STARTED,
  WsBadRequestException,
  POLL_RANKING_SUBMITTED,
  POLL_CLOSED,
  POLL_ENDED,
} from '@modules/websockets';
import { PollAdminGuard } from '../guards/poll-admin.guard';
import { AddNominationDto, RemoveNominationDto } from '../dto/poll-request.dto';
import { Socket } from 'dgram';

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
      `A user with id: ${client.participantId} joined a poll created by ${client.adminId} with the room name: ${roomName}`,
    );
    this.logger.debug(
      `Total clients connected to the room '${roomName}': ${connectedClients}`,
    );

    const updatedPoll = await this.pollsService.addParticipant(client.pollId, {
      participant_id: client.participantId,
    });
    this.io.to(roomName).emit(POLL_UPDATED, updatedPoll);
  }

  async handleDisconnect(client: SocketAuth) {
    const sockets = this.io.sockets;

    const roomName = client.pollId;
    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    const updatedPoll = await this.pollsService.leavePoll(client.pollId, {
      participant_id: client.participantId,
    });
    this.logger.log(`Websocket Client with ${client.id} disconnected...`);
    this.logger.debug(`Number of connected sockets are: ${sockets.size}...`);
    this.logger.debug(
      `Total clients connected to the room '${roomName}': ${connectedClients}`,
    );

    if (updatedPoll) {
      this.io.to(roomName).emit(POLL_UPDATED, updatedPoll);
    }
  }

  @UseGuards(PollAdminGuard)
  @SubscribeMessage(POLL_REMOVE_PARTICIPANT)
  async removeParticipant(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketAuth,
  ) {
    this.logger.debug(
      `Attempting to remove participant with id: ${id} from the poll ${client.pollId}`,
    );
    const updatedPoll = await this.pollsService.removeParticipant(
      client.adminId,
      client.pollId,
      {
        participant_id: id,
      },
    );

    if (updatedPoll) {
      this.io.to(client.pollId).emit(POLL_UPDATED, updatedPoll);
    }
  }

  @SubscribeMessage(POLL_PARTICIPANT_ADD_NOMINATION)
  async addNomination(
    @MessageBody() nomination: AddNominationDto,
    @ConnectedSocket() client: SocketAuth,
  ) {
    this.logger.debug(
      `Attempting to add nomination for participant with id: ${client.participantId} from the poll ${client.pollId}`,
    );
    const updatedPoll = await this.pollsService.addNomination(
      client.pollId,
      nomination,
    );

    if (updatedPoll) {
      this.io.to(client.pollId).emit(POLL_UPDATED, updatedPoll);
    }
  }

  @UseGuards(PollAdminGuard)
  @SubscribeMessage(POLL_PARTICIPANT_DEL_NOMINATION)
  async removeNomination(
    @MessageBody() nomination: RemoveNominationDto,
    @ConnectedSocket() client: SocketAuth,
  ) {
    this.logger.debug(
      `Attempting to remove nomination for participant with id: ${client.participantId} from the poll ${client.pollId}`,
    );
    const updatedPoll = await this.pollsService.removeNomination(
      client.pollId,
      nomination,
    );

    if (updatedPoll) {
      this.io.to(client.pollId).emit(POLL_UPDATED, updatedPoll);
    }
  }

  @UseGuards(PollAdminGuard)
  @SubscribeMessage(POLL_STARTED)
  async startPoll(@ConnectedSocket() client: SocketAuth) {
    this.logger.debug(`Attempting to start poll with id: ${client.pollId}`);
    const poll = await this.pollsService.findOneUsingRedis(client.id);
    if (!poll.has_started) {
      await this.pollsService.startPoll(client.id);
      this.io.to(client.pollId).emit(POLL_STARTED, poll);
    } else {
      throw new WsBadRequestException('Poll has already been started');
    }
  }

  @SubscribeMessage(POLL_RANKING_SUBMITTED)
  async submitRankings(
    @MessageBody('rankings') rankings: string[],
    @ConnectedSocket() client: SocketAuth,
  ) {
    this.logger.debug(
      `Attempting to submit to the poll with id: ${client.pollId}`,
    );
    const updatedPoll = await this.pollsService.submitRankings(client.pollId, {
      participant_id: client.participantId,
      rankings: rankings,
    });
    if (updatedPoll) {
      this.io.to(client.pollId).emit(POLL_UPDATED);
    }
  }

  @UseGuards(PollAdminGuard)
  @SubscribeMessage(POLL_CLOSED)
  async closePoll(@ConnectedSocket() client: SocketAuth) {
    this.logger.debug(
      `Closing the poll with id ${client.pollId} and tallying results`,
    );

    const poll = await this.pollsService.tallyResults(client.pollId);

    this.io.to(client.pollId).emit(POLL_CLOSED, poll);
  }

  @UseGuards(PollAdminGuard)
  @SubscribeMessage(POLL_ENDED)
  async endPoll(@ConnectedSocket() client: SocketAuth) {
    this.logger.debug(`Ending the poll with the id ${client.pollId}`);

    await this.pollsService.deletePoll(client.pollId);

    this.io.to(client.pollId).emit(POLL_ENDED);
  }
}
