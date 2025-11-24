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

  // @Get('add')
  // add() {
  //   const draftInfo = this.videoService.addvideo(
  //     '9a8c18fa-25cb-4d62-8da9-9a1166055036',
  //     {
  //       fileName: '林俊杰_-_谢幕_MQ.mp3',
  //       filePath: '/audio/林俊杰_-_谢幕_MQ.mp3',
  //       duration_us: 243905306,
  //     },
  //   );
  //   return draftInfo;
  // }
}
