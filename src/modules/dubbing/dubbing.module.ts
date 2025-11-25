import { Module } from '@nestjs/common';
import { FileModule } from '@/shared/file/file.module';
import { HttpModule } from '@nestjs/axios';
import { DraftModule } from '../draft/draft.module';
import { AudioModule } from '../audio/audio.module';
import { TtsModule } from '../tts/tts.module';
import { DubbingService } from './dubbing.service';
import { DubbingController } from './dubbing.controller';

@Module({
  imports: [FileModule, HttpModule, DraftModule, AudioModule, TtsModule],
  controllers: [DubbingController],
  providers: [DubbingService],
})
export class DubbingModule {}
