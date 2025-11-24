import { Module } from '@nestjs/common';
import { FileModule } from '@/shared/file/file.module';
import { HttpModule } from '@nestjs/axios';

import { TextService } from './text.service';
import { TextController } from './text.controller';

@Module({
  imports: [FileModule, HttpModule],
  controllers: [TextController],
  providers: [TextService],
})
export class TextModule {}
