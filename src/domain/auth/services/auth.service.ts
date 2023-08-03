import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@modules/config';
import { UserService } from '../../user/services/user.service';
import { UserSignInDto } from '../dto/auth-request.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../../user/entity/user.entity';
import { UserSignupDto } from '../../user/dto/user-request.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserByPassword(payload: UserSignInDto) {
    const { email, password } = payload;
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException(`user with that email: ${email} not found`);
    }
    let isMatch = false;

    isMatch = await this.comparePassword(password, user.password);

    if (isMatch) {
      const data = await this.createToken(user);
      await this.updateRefreshToken(user.email, data.refresh_token);
      return data;
    } else {
      throw new NotFoundException(`user with email password not found`);
    }
  }

  public async validateJwtPayload(payload: JwtPayload) {
    const data = await this.usersService.findOneByEmail(payload.email);
    delete data.password;
    return data;
  }

  public async logout(user: UserEntity) {
    await this.usersService.updateRefreshTokenByEmail(user.email, null);
  }

  public async refreshToken(user: UserEntity) {
    const { refresh_token, email } = user;

    const userData = await this.usersService.findOneByEmail(email);
    if (!userData) {
      throw new ForbiddenException();
    }
    const isMatchFound = await bcrypt.compare(
      refresh_token,
      userData.refresh_token,
    );
    if (!isMatchFound) {
      throw new ForbiddenException();
    }
    const tokens = await this.createToken(user);
    await this.updateRefreshToken(user.email, tokens.refresh_token);
    return tokens;
  }

  public async createToken(user: UserEntity) {
    const data: JwtPayload = {
      userId: user.id,
      email: user.email,
      permissions: user.permissions,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(data, {
        secret: this.configService.get().auth.access_token_secret,
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(data, {
        secret: this.configService.get().auth.refresh_token_secret,
        expiresIn: '1d',
      }),
    ]);

    return {
      ...data,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  public async createSocialAuthToken(user: any) {
    let savedUser = await this.usersService.findOneByEmail(user.email);

    if (!savedUser) {
      savedUser = await this.usersService.create({
        email: user.username,
        password: uuidv4(),
      } as UserSignupDto);
    }

    const data: JwtPayload = {
      userId: savedUser.id,
      email: savedUser.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(data, {
        secret: this.configService.get().auth.access_token_secret,
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(data, {
        secret: this.configService.get().auth.refresh_token_secret,
        expiresIn: '1d',
      }),
    ]);

    return {
      ...data,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async updateRefreshToken(email: string, refToken: string) {
    await this.usersService.updateRefreshTokenByEmail(email, refToken);
  }

  private async comparePassword(enteredPassword: string, dbPassword: string) {
    return await bcrypt.compare(enteredPassword, dbPassword);
  }
}
