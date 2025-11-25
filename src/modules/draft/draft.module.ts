import { Module } from '@nestjs/common';
import { DraftController } from './draft.controller';
import { DraftService } from './draft.service';
import { FileModule } from '@/shared/file/file.module';

@Module({
  imports: [FileModule],
  controllers: [DraftController],
  providers: [DraftService],
  exports: [DraftService],
})
export class DraftModule {}
