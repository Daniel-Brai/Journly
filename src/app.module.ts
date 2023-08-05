import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { DomainModule } from '@domain/domain.module';
import { ConfigModule } from '@modules/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule, DomainModule, TerminusModule, HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
