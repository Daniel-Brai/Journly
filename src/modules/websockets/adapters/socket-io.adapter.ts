import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '@modules/config';
import { Server } from 'socket.io';
import { createTokenMiddleware } from '../middlewares/socket-io.middleware';

export class SocketIOAdapter extends IoAdapter {
  private readonly jwtService: JwtService;
  private readonly logger: Logger;

  constructor(
    private readonly app: INestApplicationContext,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const PORT = Number(this.configService.get().port);

    const cors = {
      origin: [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`],
    };

    const corsOptions: ServerOptions = {
      ...options,
      cors,
    };

    const server: Server = super.createIOServer(port, corsOptions);
    server.of('polls').use(createTokenMiddleware(this.jwtService, this.logger));

    return server;
  }
}
