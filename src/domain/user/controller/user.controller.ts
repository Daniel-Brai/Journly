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
} from "@nestjs/common";
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
} from "@nestjs/swagger";
import { Logger } from "@modules/logger";
import { UserRoles } from "@modules/types";
import { AccessTokenGuard } from "../../auth/guards/access-token.guard";
import { RoleAllowed } from "../../auth/decorators/roles.decorator";
import { RolesGuard } from "../../auth/guards/role.guard";
import {
  FindUserDto,
  UpdateUserByIdDto,
  UpdateUserPermissionBodyDto,
  UserSignupDto,
  fieldsToUpdateDto,
} from "../dto/user-request.dto";
import { UserSignupResponseDto } from "../dto/user-response.dto";
import { UserService } from "../services/user.service";
import { User } from "../../auth/guards/request-user.guard";
import { UserEntity } from "../entity/user.entity";
import {
  NO_ENTITY_FOUND,
  UNAUTHORIZED_REQUEST,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from "../../../app.consts";


@ApiBearerAuth("authorization")
@Controller("api/v1/users")
@ApiTags("Users")
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly logger: Logger
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: UserSignupResponseDto,
    description: "user created successfully",
  })
  @ApiOkResponse({ type: UserSignupResponseDto, description: "" })
  @ApiOperation({ description: "user create api " })
  @ApiConsumes("application/json")
  @Post("")
  public async CreateUser(@Body() body: UserSignupDto) {
    this.logger.info(JSON.stringify(body));
    return this.service.create(body);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: UserSignupResponseDto,
    description: "user updated successfully",
  })
  @ApiOkResponse({ type: UserSignupResponseDto, description: "" })
  @ApiOperation({ description: "user update api " })
  @ApiConsumes("application/json")
  @Put("/:id")
  public async UpdateUser(@Body() body: fieldsToUpdateDto) {
    return this.service.update(body.email, body);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @RoleAllowed(UserRoles["system-admin"])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserSignupResponseDto, description: "" })
  @ApiOperation({ description: "find users based on props " })
  @ApiConsumes("application/json")
  @Get("/search")
  public async findUser(@Param() param: FindUserDto) {
    this.logger.info(JSON.stringify(param));
    return this.service.findUserByProperty(param);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @RoleAllowed(UserRoles["system-admin"])
  @ApiConsumes("application/json")
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: "assign permissions" })
  @ApiOperation({
    description: "assign permission to user",
  })
  @ApiOkResponse({
    description: "assign permissions to the user",
  })
  @ApiConsumes("application/json")
  @Put("/assign-permissions/:id")
  public async assignUserPermissions(
    @Param() param: UpdateUserByIdDto,
    @Body() payload: UpdateUserPermissionBodyDto
  ) {
    return this.service.assignUserPermissions(param, payload);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @RoleAllowed(UserRoles["system-admin"])
  @ApiConsumes("application/json")
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: "users returned successfully" })
  @ApiOperation({
    description: "Get all Users",
  })
  @ApiOkResponse({
    description: "Returns users details",
  })
  @ApiConsumes("application/json")
  @Get("/")
  public async allUsers() {
    return this.service.getAllUsers();
  }

  public async DeleteUser() {}

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes("application/json")
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: "user returned successfully" })
  @ApiOperation({
    description: "get current session User",
  })
  @ApiOkResponse({
    description: "return session user details",
  })
  @Get("/profile")
  public async getUserProfile(@User() user: UserEntity) {
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConsumes("application/json")
  @ApiNotFoundResponse({ description: NO_ENTITY_FOUND })
  @ApiForbiddenResponse({ description: UNAUTHORIZED_REQUEST })
  @ApiUnprocessableEntityResponse({ description: BAD_REQUEST })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  @ApiOkResponse({ description: "user returned successfully" })
  @ApiOperation({
    description: "delete current session User",
  })
  @ApiOkResponse({
    description: "return no content",
  })
  @Delete("/profile/delete")
  public async deleteUserAccount(@User() user: UserEntity) {
    return user;
  }
}

