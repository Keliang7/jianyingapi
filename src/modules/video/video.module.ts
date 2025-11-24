import { Module } from '@nestjs/common';
import { FileModule } from '@/shared/file/file.module';
import { HttpModule } from '@nestjs/axios';

import { VideoService } from './video.service';
import { VideoController } from './video.controller';

@Module({
  imports: [FileModule, HttpModule],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
