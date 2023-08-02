// Native.
import { Request, Response } from "@nestjs/common";

// Package.
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Logger } from "@modules/logger";
import { UserRoles } from "@modules/types";
import { AuthService } from "../services/auth.service";
import { UserSignInDto } from "../dto/auth-request.dto";
import { UserSignInResponseDto } from "../dto/auth-response.dto";
import { RefreshTokenGuard } from "../guards/refresh-token.guard";
import { AccessTokenGuard } from "../guards/access-token.guard";
import { GoogleOauthGuard } from "../guards/google-auth.guard";
import { GithubOauthGuard } from "../guards/github-auth.guard";


@ApiBearerAuth("authorization")
@Controller("api/v1/auth")
@ApiTags("Authentication")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger
  ) {}


  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "user login api returns access token" })
  @ApiOkResponse({
    description: "user has logged successfully",
    type: UserSignInResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: "internal server error occurred",
  })
  @ApiBadRequestResponse({ description: "bad request" })
  @ApiConsumes("application/json")
  @Post("/login")
  public async CreateUser(
    @Body() body: UserSignInDto,
    @Request() _req: any,
    @Response() res: any,
  ) {
    const response = await this.authService.validateUserByPassword(body);
    res.cookie("access_token", response.access_token, {
      httpOnly: true,
      sameSite: "lax",
    });
    res.cookie("refresh_token", response.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
    });
    return res.send(response);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes("application/json")
  @Get("/logout")
  public async logout(@Request() _req: any, @Response() res: any) {
    res.cookie("access_token", "", {
      httpOnly: true,
      sameSite: "lax",
    });
    res.cookie("refresh_token", "", {
      httpOnly: true,
      sameSite: "lax",
    });
    return res.send();
  }
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes("application/json")
  @Post("/refresh")
  public async refreshToken(@Req() req: any) {
    const user = req.user;
    return await this.authService.refreshToken(user);
  }

  @Get('social/google/login')
  @UseGuards(GoogleOauthGuard)
  async googleAuth(@Req() _req: any) {
    //
  }

  @Get("social/google/callback")
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Request() req: any, @Response() res: any) {
    const response = await this.authService.createSocialAuthToken(req.user);
    res.cookie("access_token", response.access_token, {
      httpOnly: true,
      sameSite: "lax",
    });
    res.cookie("refresh_token", response.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
    });
    return res.redirect('/');
  }

  @Get('social/github/login')
  @UseGuards(GithubOauthGuard)
  async githubAuth(@Req() _req: any) {
    //
  }

  @Get("social/github/callback")
  @UseGuards(GithubOauthGuard)
  async githubAuthRedirect(@Request() req: any, @Response() res: any) {
    const response = await this.authService.createSocialAuthToken(req.user);
    res.cookie("access_token", response.access_token, {
      httpOnly: true,
      sameSite: "lax",
    });
    res.cookie("refresh_token", response.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
    });
    return res.redirect(`/`);
  }
}

