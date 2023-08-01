import { Module } from "@nestjs/common";
import { DatabaseConfig } from "./database.interface";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigModule, ConfigService, ConfigDatabase } from "@modules/config";

@Module({})
export class DatabaseModule {
  private static getConnectionOptions(
    config: ConfigService,
    dbConfig: DatabaseConfig
  ): TypeOrmModuleOptions {
    const dbData = config.get().database;
    if (!dbData) {
      throw Error("");
    }
    const connectionOptions = this.getConnectionOptionsPostgres(dbData);
    return {
      ...connectionOptions,
      entities: dbConfig.entities,
      synchronize: true,
      logging: true,
    };
  }

  private static getConnectionOptionsPostgres(
    dbData: ConfigDatabase
  ): TypeOrmModuleOptions {
    return {
      type: "postgres",
      host: dbData.host,
      port: dbData.port,
      username: dbData.username,
      password: dbData.password,
      database: dbData.name,
      // url: dbData.url,
      keepConnectionAlive: true,
      ssl:
        process.env.NODE_ENV !== "local" && process.env.NODE_ENV !== "test"
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  public static forRoot(dbConfig: DatabaseConfig) {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            return DatabaseModule.getConnectionOptions(configService, dbConfig);
          },
          inject: [ConfigService],
        }),
      ],
      controllers: [],
      providers: [],
      exports: [],
    };
  }
}

