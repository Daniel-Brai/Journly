import { Module } from "@nestjs/common";
import { LoggerModule } from "@modules/logger";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@modules/config";
import { AccessTokenJwtStrategy } from "./strategies/access-jwt.strategy";
import { RolesGuard } from "./guards/role.guard";

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt", session: false }),
    JwtModule.register({}),
  ],
  controllers: [],
  providers: [AccessTokenJwtStrategy, RolesGuard],
  exports: [],
})
export class AuthModule {}
