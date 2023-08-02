import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@modules/config";
import { LoggerModule } from "@modules/logger";
import { AuthModule } from "../auth/auth.module";
import { UserEntity } from "./entity/user.entity";
import { UserController } from "./controller/user.controller";
import { UserService } from "./services/user.service";


@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    LoggerModule,
    ConfigModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
