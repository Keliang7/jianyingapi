import { Body, Controller, Get, Post } from '@nestjs/common';
import { DubbingService } from './dubbing.service';

@Controller('dubbing')
export class DubbingController {
  constructor(private readonly dubbingService: DubbingService) {}

  @Get('/split-text')
  splitText() {
    const textArr = this.dubbingService.generateAudio(
      '庆历四年春，滕子京谪守巴陵郡。越明年，政通人和，百废具兴，乃重修岳阳楼，增其旧制，刻唐贤今人诗赋于其上；属予作文以记之',
    );

    return textArr;
  }

  @Post('/generateAudio')
  async generateAudio(@Body() body: { texts: string }) {
    const result = await this.dubbingService.generateAudio(body.texts);

    return result;
  }

  @Post('/get-time-line')
  buildTimeline(
    @Body()
    body: {
      path: string;
      duration_s: number;
      duration_us: number;
    }[],
  ) {
    return this.dubbingService.buildTimeline(body);
  }
}
