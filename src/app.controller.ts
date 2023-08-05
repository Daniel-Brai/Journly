import { Controller, Get, Res } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  getRoot(@Res() res: Response) {
    return this.appService.getRoot(res);
  }

  @Get('/api/health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('journly', 'http://localhost:8000'),
      () => this.db.pingCheck('database'),
    ]);
  }
}
