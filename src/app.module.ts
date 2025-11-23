import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { DraftModule } from './modules/draft/draft.module';
import { FileModule } from './shared/file/file.module';

@Module({
  imports: [RedisModule, FileModule, DraftModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
