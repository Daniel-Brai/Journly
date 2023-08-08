import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  SocketAuth,
  SocketAuthPayload,
  WsUnauthorizedException,
} from '@modules/websockets';

@Injectable()
export class PollAdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: SocketAuth = context.switchToWs().getClient();

    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers['X-Poll-Signature'];
    const userId = socket.handshake.headers['X-User-Id'];

    if (!token || !userId) {
      throw new WsUnauthorizedException('No identifier tokens provided');
    }

    try {
      type WSPayload = SocketAuthPayload & { sub: string };
      const payload = this.jwtService.verify<WSPayload>(token);

      const { adminId } = payload;

      if (userId !== adminId) {
        throw new WsUnauthorizedException(
          'You are not authorized - Admin priviledge required!',
        );
      }

      return true;
    } catch (error) {
      throw new WsUnauthorizedException(
        'You are not authorized - Admin priviledge required!',
      );
    }
  }
}
