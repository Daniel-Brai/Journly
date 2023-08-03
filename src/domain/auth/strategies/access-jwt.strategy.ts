import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@modules/config';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AccessTokenJwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          const data = request?.cookies['access_token'];
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      secretOrKey: `${configService.get().auth.access_token_secret}`,
    });
  }
  async validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
