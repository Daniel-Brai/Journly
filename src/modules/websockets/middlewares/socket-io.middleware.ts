import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

export type SocketAuthPayload = {
  adminId: string;
  participantId: string;
  pollId: string;
  pollName: string;
};

export type SocketAuth = Socket & SocketAuthPayload;

export const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) =>
  (socket: SocketAuth, next: any) => {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers['X-Poll-Signature'];

    const socketUserId =
      (socket.handshake.headers['X-User-Id'] as string) ?? '';

    logger.debug(
      `Verifying poll signature token: ${token} before connection....`,
    );

    try {
      const payload = jwtService.verify(token);
      socket.adminId = payload.sub;
      socket.pollId = payload.pollId;
      socket.participantId = socketUserId;
      socket.pollName = payload.pollName;
      next();
    } catch (error) {
      next(new Error('Forbidden Exception'));
    }
  };
