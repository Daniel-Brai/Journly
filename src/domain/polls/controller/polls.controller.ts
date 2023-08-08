import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CloudinaryService } from '@modules/cloudinary';
import { PollsService } from '../services/polls.service';
import {
  CreatePollDto,
  InviteToPollDto,
  JoinPollDto,
  LeavePollDto,
} from '../dto/poll-request.dto';
import {
  CreatedPollResponseDto,
  GenericPollMessageResponseDto,
} from '../dto/poll-response.dto';
import { PollAccessGuard } from '../guards/poll-access.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { User } from '../../auth/guards/request-user.guard';
import { UserEntity } from '../../user/entity/user.entity';
import {
  NO_ENTITY_FOUND,
  UNAUTHORIZED_REQUEST,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from '../../../app.consts';
import { Response } from 'express';

@ApiBearerAuth('authorization')
@Controller('api/v1/polls')
@ApiTags('Polls')
export class PollsController {
  constructor(
    private readonly pollsService: PollsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: CreatePollDto,
    description: 'Poll created successfully',
  })
  @ApiOkResponse({ type: CreatedPollResponseDto, description: '' })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOperation({ description: 'Poll create api ' })
  @ApiConsumes('application/json')
  @UseInterceptors(FileInterceptor('file'))
  @Post('')
  public async CreatePoll(
    @Body() body: CreatePollDto,
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserEntity,
    @Res() res: Response,
  ) {
    if (file !== null && file !== undefined) {
      const { secure_url } = await this.cloudinaryService.uploadFile(file);
      body.topic_image_url = secure_url;
    }
    const response = await this.pollsService.create(user, body);
    res.cookie('poll_signature_token', response.signature, {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.setHeader('X-Poll-Signature', response.signature);
    return res.send(response);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: 'Poll joined successfully' })
  @ApiOperation({
    description: 'Join a poll by id',
  })
  @ApiOkResponse({
    type: GenericPollMessageResponseDto,
    description: '',
  })
  @Post('/join/:id')
  public async JoinPoll(
    @Param('id') id: string,
    @Body() body: JoinPollDto,
    @Res() res: Response,
  ) {
    const response = await this.pollsService.addParticipant(id, body);
    res.cookie('poll_signature_token', response.data.signature, {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.setHeader('X-Poll-Signature', response.data.signature);
    return res.send(response);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: 'Poll rejoined successfully' })
  @ApiOperation({
    description: 'Rejoin a poll by id',
  })
  @ApiOkResponse({
    description: 'User rejoins a poll successfully',
  })
  @Post('/rejoin/:id')
  public async RejoinPoll(
    @Param('id') id: string,
    @Body() body: JoinPollDto,
    @Res() res: Response,
  ) {
    const response = await this.pollsService.addParticipant(id, body);
    res.cookie('poll_signature_token', response.data.signature, {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.setHeader('X-Poll-Signature', response.data.signature);
    return res.send(response);
  }

  @UseGuards(AccessTokenGuard, PollAccessGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: 'Poll left successfully' })
  @ApiOperation({
    description: 'Leave a poll by id',
  })
  @ApiOkResponse({
    description: 'User leaves a poll successfully',
  })
  @Get('/leave/:id')
  public async LeavePoll(
    @Param('id') id: string,
    @Body() body: LeavePollDto,
    @Res() res: Response,
  ) {
    const response = await this.pollsService.leavePoll(id, body);
    res.cookie('poll_signature_token', '', {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.setHeader('X-Poll-Signature', '');
    return res.send(response);
  }

  @UseGuards(AccessTokenGuard, PollAccessGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: 'User invited to poll successfully' })
  @ApiOperation({
    description: 'Invite to a poll',
  })
  @ApiOkResponse({
    type: GenericPollMessageResponseDto,
    description: '',
  })
  @Post('/invite/:id')
  public async InviteToPoll(
    @Param('id') id: string,
    @Body() body: InviteToPollDto,
    @Res() res: Response,
  ) {
    const response = await this.pollsService.inviteParticipant(id, body);
    return res.send(response);
  }
}
