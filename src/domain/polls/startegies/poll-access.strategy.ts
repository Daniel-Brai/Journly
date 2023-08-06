import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@modules/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class PollAccessStrategy extends PassportStrategy(
  Strategy,
  'poll-access',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          const data = request?.cookies['poll_signature_token'];
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      secretOrKey: `${configService.get().polls.signing_secret}`,
      passReqToCallback: true,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
