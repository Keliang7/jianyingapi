import { Controller, Get, Query } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('parse')
  parse(@Query('url') url: string) {
    console.log(123);
    const videoInfo = this.videoService.parseVideo(url);
    return videoInfo;
  }

  @Get('add')
  add() {
    const draftInfo = this.videoService.addVideo(
      '12872578-b14a-4671-a1a3-712cf512cd88',
      {
        fileName: 'RPReplay_Final1736709500.MP4',
        filePath: 'video/RPReplay_Final1736709500.MP4',
        duration_us: 9380861,
      },
    );
    return draftInfo;
  }
}
