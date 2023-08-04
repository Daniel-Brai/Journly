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
import { Logger } from '@modules/logger';
import { CloudinaryService } from '@modules/cloudinary';
import { UserRoles } from '@modules/types';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RoleAllowed } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/role.guard';
import {
  FindUserDto,
  UpdateUserByIdDto,
  UpdateUserPermissionBodyDto,
  UserSignupDto,
  fieldsToUpdateDto,
} from '../dto/user-request.dto';
import { UserSignupResponseDto } from '../dto/user-response.dto';
import { UserService } from '../services/user.service';
import { User } from '../../auth/guards/request-user.guard';
import { UserEntity } from '../entity/user.entity';
import {
  NO_ENTITY_FOUND,
  UNAUTHORIZED_REQUEST,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from '../../../app.consts';

@ApiBearerAuth('authorization')
@Controller('api/v1/users')
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private cloudinaryService: CloudinaryService,
    private readonly logger: Logger,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: UserSignupResponseDto,
    description: 'User created successfully',
  })
  @ApiOkResponse({ type: UserSignupResponseDto, description: '' })
  @ApiOperation({ description: 'User create api ' })
  @ApiConsumes('application/json')
  @Post('')
  public async CreateUser(@Body() body: UserSignupDto) {
    this.logger.info(JSON.stringify(body));
    return this.userService.create(body);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: UserSignupResponseDto,
    description: 'User updated successfully',
  })
  @ApiOkResponse({ type: UserSignupResponseDto, description: '' })
  @ApiOperation({ description: 'User update api ' })
  @ApiConsumes('application/json')
  @UseInterceptors(FileInterceptor('file'))
  @Put('/:id')
  public async UpdateUser(
    @Body() body: fieldsToUpdateDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file !== null && file !== undefined) {
      const { secure_url } = await this.cloudinaryService.uploadFile(file);
      body.profile_photo_url = secure_url;
    }
    return this.userService.update(body.email, body);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @RoleAllowed(UserRoles['system-admin'])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserSignupResponseDto, description: '' })
  @ApiOperation({ description: 'Find Users based on props ' })
  @ApiConsumes('application/json')
  @Get('/search')
  public async findUser(@Param() param: FindUserDto) {
    this.logger.info(JSON.stringify(param));
    return this.userService.findUserByProperty(param);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @RoleAllowed(UserRoles['system-admin'])
  @ApiConsumes('application/json')
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: 'assign permissions' })
  @ApiOperation({
    description: 'Assign Permission to User',
  })
  @ApiOkResponse({
    description: 'Assign Permissions to a User',
  })
  @ApiConsumes('application/json')
  @Put('/assign-permissions/:id')
  public async assignUserPermissions(
    @Param() param: UpdateUserByIdDto,
    @Body() payload: UpdateUserPermissionBodyDto,
  ) {
    return this.userService.assignUserPermissions(param, payload);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @RoleAllowed(UserRoles['system-admin'])
  @ApiConsumes('application/json')
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: 'Users returned successfully' })
  @ApiOperation({
    description: 'Get all Users',
  })
  @ApiOkResponse({
    description: 'Returns users details',
  })
  @ApiConsumes('application/json')
  @Get('/')
  public async allUsers() {
    return this.userService.getAllUsers();
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @RoleAllowed(UserRoles['system-admin'])
  @ApiConsumes('application/json')
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiNoContentResponse({ description: '' })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: 'User removed successfully' })
  @ApiOperation({
    description: 'Delete a User',
  })
  @ApiOkResponse({
    description: 'Returns no content',
  })
  @Delete('/delete/:id')
  public async deleteUser(@Param() id: string) {
    return this.userService.deleteUser(id);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: 'User returned successfully' })
  @ApiOperation({
    description: 'Get Current Session User',
  })
  @ApiOkResponse({
    description: 'Returns Session User details',
  })
  @Get('/profile')
  public async getUserProfile(@User() user: UserEntity) {
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: 'User returned successfully' })
  @ApiOperation({
    description: "Update Current Session User's Profile",
  })
  @ApiOkResponse({
    description: 'Returns Updated Session User details',
  })
  @Put('/profile')
  public async updateUserProfile(@User() user: UserEntity) {
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConsumes('application/json')
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiNoContentResponse({ description: '' })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOperation({
    description: 'Delete Current Session User Profile',
  })
  @ApiOkResponse({
    description: 'Returns no content',
  })
  @Delete('/profile/delete')
  public async deleteUserProfile(@User() user: UserEntity) {
    return this.userService.deleteUser(user.id);
  }
}
