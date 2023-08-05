import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CloudinaryService } from '@modules/cloudinary';
import { PollsService } from '../services/polls.service';
import { CreatePollDto } from '../dto/poll-request.dto';
import { CreatedPollResponseDto, GenericPollMessageResponseDto } from '../dto/poll-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { User } from '../../auth/guards/request-user.guard';
import { UserEntity } from '../../user/entity/user.entity';
import {
  NO_ENTITY_FOUND,
  UNAUTHORIZED_REQUEST,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from '../../../app.consts';


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
  ) { 
    if (file !== null && file !== undefined) {
      const { secure_url } = await this.cloudinaryService.uploadFile(file);
      body.topic_image_url = secure_url;
    }
    return this.pollsService.create(body);
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
    description: "Join a poll by id",
  })
  @ApiOkResponse({
    type: GenericPollMessageResponseDto,
    description: '',
  })
  @Put('/join/:id')
  public async JoinPoll(@Param() id: string, @User() user: UserEntity) {
    return this.pollsService.addParticipant(user.id, id);
  }
}
