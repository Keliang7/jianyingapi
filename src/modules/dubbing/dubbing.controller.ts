import { Body, Controller, Post } from '@nestjs/common';
import { DubbingService } from './dubbing.service';

@Controller('dubbing')
export class DubbingController {
  constructor(private readonly dubbingService: DubbingService) {}

  @Post('/generateAudio')
  async generateAudio(@Body() body: { texts: string }) {
    const result = await this.dubbingService.generateAudio(
      body.texts ||
        '庆历四年春，滕子京谪守巴陵郡。越明年，政通人和，百废具兴，乃重修岳阳楼，增其旧制，刻唐贤今人诗赋于其上；属予作文以记之',
    );
    return result;
  }

  @Post('/add-material')
  async addMaterial() {
    return this.dubbingService.addMaterial({
      filePath: '/audio/属予作文以记之.mp3',
      fileName: '属予作文以记之.mp3',
      draft_id: '12872578-b14a-4671-a1a3-712cf512cd88',
    });
  }
  // "material_id": "721aa459-557d-486d-8a1b-5d6a8ff64025"

  // "material_id": "23c9bb2e-aee1-4e8e-9256-c52004099105"

  @Post('/add-track')
  async addTrack() {
    return this.dubbingService.addTrack('12872578-b14a-4671-a1a3-712cf512cd88');
  }
  // "track_id": "4e71cfb7-38d6-40d1-8bb9-cce1bbc67a69"

  @Post('/add-segment')
  async addSegment() {
    return this.dubbingService.addSegment(
      '12872578-b14a-4671-a1a3-712cf512cd88',
      '4e71cfb7-38d6-40d1-8bb9-cce1bbc67a69',
      '23c9bb2e-aee1-4e8e-9256-c52004099105',
      {
        duration_us: 10000000,
      },
    );
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
