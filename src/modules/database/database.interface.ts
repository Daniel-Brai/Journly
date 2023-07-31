import { DataSourceOptions } from "typeorm";

export interface DatabaseConfig {
  entities: DataSourceOptions["entities"];
}

