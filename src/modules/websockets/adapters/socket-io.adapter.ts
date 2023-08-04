import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ServerOptions } from "socket.io";
import { ConfigService } from "@modules/config";

export class SocketIOAdapter extends IoAdapter {
  constructor(
    private readonly app: INestApplicationContext,
    private readonly configService: ConfigService,  
  ) {
    super(app);
  }

  createIOServer(port: number,  options?: ServerOptions) {
    const clientPort = Number(this.configService.get().port);

    const cors = {
      origin: [
        `http://localhost:${clientPort}`,
      ]
    };

    const corsOptions: ServerOptions = {
      ...options,
      cors,
    }

    return super.createIOServer(port, corsOptions);
  }
}
