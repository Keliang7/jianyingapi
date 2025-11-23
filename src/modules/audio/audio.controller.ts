import { Controller, Get, Query } from '@nestjs/common';
import { AudioService } from './audio.service';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get('parse')
  getProfile(@Query('url') url: string) {
    const draftInfo = this.audioService.parseAudio(url);
    return draftInfo;
  }

  // @Get(':id')
  // getUserById(@Param('id') id: number) {
  //   const db = this.configService.get(ConfigKeys.DB_PORT);
  //   console.log(db);
  //   return this.userService.findOne(id);
  // }
}
