import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  BadRequestException,
} from '@nestjs/common';
import {
  WsBadRequestException,
  WsUnauthorizedException,
  WsUnknownException,
} from '../types/ws-exception.type';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToWs().getClient();
    let wsException:
      | WsBadRequestException
      | WsUnauthorizedException
      | WsUnknownException;

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      const message = response['message'] ?? response ?? exception.name;
      wsException = new WsBadRequestException(message);

      ctx.emit('exception', wsException.getError());
      return;
    }

    wsException = new WsUnknownException(exception.message);
    ctx.emit('exception', wsException.getError());
  }
}
