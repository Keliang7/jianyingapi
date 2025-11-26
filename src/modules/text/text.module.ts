import { Module } from '@nestjs/common';
import { FileModule } from '@/shared/file/file.module';
import { HttpModule } from '@nestjs/axios';
import { DraftModule } from '../draft/draft.module';
import { TextService } from './text.service';
import { TextController } from './text.controller';

@Module({
  imports: [FileModule, HttpModule, DraftModule],
  controllers: [TextController],
  providers: [TextService],
  exports: [TextService],
})
export class TextModule {}
