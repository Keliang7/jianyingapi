import { Controller, Get, Query } from '@nestjs/common';
import { AudioService } from './audio.service';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get('parse')
  getProfile(@Query('url') url: string) {
    const audioInfo = this.audioService.parseAudio(url);
    return audioInfo;
  }

  @Get('add')
  getUserById() {
    const draftInfo = this.audioService.addAudio(
      '9a8c18fa-25cb-4d62-8da9-9a1166055036',
      {
        fileName: '林俊杰_-_谢幕_MQ.mp3',
        filePath: '/audio/林俊杰_-_谢幕_MQ.mp3',
        duration_us: 243905306,
      },
    );
    return draftInfo;
  }
}
