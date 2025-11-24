import { Controller, Get } from '@nestjs/common';
import { TextService } from './text.service';

@Controller('text')
export class TextController {
  constructor(private readonly textService: TextService) {}

  @Get('add')
  add() {
    const draftInfo = this.textService.addText(
      '12872578-b14a-4671-a1a3-712cf512cd88',
      '庆历四年春',
      {
        start: 0,
        end: 10000000,
      },
    );
    return draftInfo;
  }
}
