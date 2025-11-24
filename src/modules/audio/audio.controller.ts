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
      '12872578-b14a-4671-a1a3-712cf512cd88',
      {
        fileName: '林俊杰_-_谢幕_MQ.mp3',
        filePath: 'audio/林俊杰_-_谢幕_MQ.mp3',
        duration_us: 243905306,
      },
    );
    return draftInfo;
  }
}
