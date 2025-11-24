import { Controller, Post, Body } from '@nestjs/common';
import { TtsService } from './tts.service';

@Controller('tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post('simple')
  async simple(@Body() body: { text: string }) {
    return this.ttsService.generateMp3(body.text, body.text + '.mp3');
  }
}
