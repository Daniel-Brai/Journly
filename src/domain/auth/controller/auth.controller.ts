import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { UserSignInDto } from '../dto/auth-request.dto';
import { UserSignInResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { GoogleOauthGuard } from '../guards/google-auth.guard';
import { GithubOauthGuard } from '../guards/github-auth.guard';
import { Response } from 'express';

@ApiBearerAuth('authorization')
@Controller('api/v1/auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'user login api returns access token' })
  @ApiOkResponse({
    description: 'user has logged successfully',
    type: UserSignInResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'internal server error occurred',
  })
  @ApiBadRequestResponse({ description: 'bad request' })
  @ApiConsumes('application/json')
  @Post('/login')
  public async CreateUser(
    @Body() body: UserSignInDto,
    @Req() _req: any,
    @Res() res: Response,
  ) {
    const response = await this.authService.validateUserByPassword(body);
    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.header('X-User-Id', response.data.userId);
    return res.send(response);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @Get('/logout')
  public async logout(@Req() _req: any, @Res() res: Response) {
    res.cookie('access_token', '', {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.cookie('refresh_token', '', {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.header('X-User-Id', '');
    return res.send();
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @Post('/refresh')
  public async refreshToken(@Req() req: any) {
    const user = req.user;
    return await this.authService.refreshToken(user);
  }

  @UseGuards(GoogleOauthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('social/google/login')
  public async googleAuth(@Req() _req: any) {}

  @UseGuards(GoogleOauthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('social/google/callback')
  public async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const response = await this.authService.createSocialAuthToken(req.user);
    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.header('X-User-Id', response.data.userId);
    return res.redirect('/');
  }

  @UseGuards(GithubOauthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('social/github/login')
  public async githubAuth(@Req() _req: any) {}

  @UseGuards(GithubOauthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('social/github/callback')
  public async githubAuthRedirect(@Req() req: any, @Res() res: Response) {
    const response = await this.authService.createSocialAuthToken(req.user);
    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.header('X-User-Id', response.data.userId);
    return res.redirect(`/`);
  }
}
