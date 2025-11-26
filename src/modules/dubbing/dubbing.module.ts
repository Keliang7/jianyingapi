import { Module } from '@nestjs/common';
import { FileModule } from '@/shared/file/file.module';
import { DraftModule } from '../draft/draft.module';
import { TextModule } from '../text/text.module';
import { TtsModule } from '../tts/tts.module';
import { DubbingService } from './dubbing.service';
import { DubbingController } from './dubbing.controller';

@Module({
  imports: [FileModule, DraftModule, TtsModule, TextModule],
  controllers: [DubbingController],
  providers: [DubbingService],
})
export class DubbingModule {}
