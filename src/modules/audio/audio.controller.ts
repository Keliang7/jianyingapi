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
      'b2b48197-7a35-4be4-aec5-dffdaa05d9ff',
      {
        fileName: '林俊杰_-_谢幕_MQ.mp3',
        filePath: '/public/audio/林俊杰_-_谢幕_MQ.mp3',
        duration_us: 243905306,
      },
    );
    return draftInfo;
  }
}
