import { Controller, Get, Query } from '@nestjs/common';
import { DraftService } from './draft.service';

@Controller('draft')
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Get('create')
  getProfile(@Query('width') width: number, @Query('height') height: number) {
    const draftInfo = this.draftService.createDraft(width, height);
    return draftInfo;
  }
}
