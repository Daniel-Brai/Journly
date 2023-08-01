import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DomainModule } from '@domain/domain.module';
import { ConfigModule } from '@modules/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule, DomainModule, TerminusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
