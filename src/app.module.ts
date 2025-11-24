import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { DraftModule } from './modules/draft/draft.module';
import { AudioModule } from './modules/audio/audio.module';
import { VideoModule } from './modules/video/video.module';
import { TextModule } from './modules/text/text.module';
import { FileModule } from './shared/file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
    // RedisModule,
    FileModule,
    DraftModule,
    AudioModule,
    VideoModule,
    TextModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
