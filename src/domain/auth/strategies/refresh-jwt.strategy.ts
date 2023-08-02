import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@modules/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../services/auth.service";

@Injectable()
export class RefreshTokenJwtStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          let data = request?.cookies["refresh_token"];
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      secretOrKey: `${configService.get().auth.refresh_token_secret}`,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const refreshToken = req?.cookies["refresh_token"];

    const user = await this.authService.validateJwtPayload(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { ...user, refresh_token: refreshToken };
  }
}

