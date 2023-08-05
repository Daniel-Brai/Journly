import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
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
    const PORT = Number(this.configService.get().port);

    const cors = {
      origin: [
        `http://localhost:${PORT}`,
        `http://127.0.0.1:${PORT}`,
      ]
    };

    const corsOptions: ServerOptions = {
      ...options,
      cors,
    }

    return super.createIOServer(port, corsOptions);
  }
}
