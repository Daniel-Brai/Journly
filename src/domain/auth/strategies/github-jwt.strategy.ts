import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@modules/config';

@Injectable()
export class GithubOauthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      clientID: `${configService.get().github.oauth_github_id}`,
      clientSecret: `${configService.get().github.oauth_github_secret}`,
      callbackURL: `${configService.get().github.oauth_github_callback}`,
      scope: ['public_profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const { id, name, emails } = profile;
    return {
      provider: 'github',
      providerId: id,
      uid: id,
      name: name.givenName,
      username: emails[0].value,
      email: emails[0].value,
    };
  }
}
