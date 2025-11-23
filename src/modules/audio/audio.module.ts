import { Module } from '@nestjs/common';
import { FileModule } from '@/shared/file/file.module';
import { HttpModule } from '@nestjs/axios';

import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';

@Module({
  imports: [FileModule, HttpModule],
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
