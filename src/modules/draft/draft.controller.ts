import { Controller, Get, Param, Body, Post, Request } from '@nestjs/common';
import { DraftService } from './draft.service';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from 'src/common/constants/config-keys.enum';

@Controller('draft')
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Get('create')
  getProfile(@Param('width') width: number, @Param('height') height: number) {
    console.log('get');
    const draftInfo = this.draftService.createDraft(width, height);
    return draftInfo;
  }

  // @Get(':id')
  // getUserById(@Param('id') id: number) {
  //   const db = this.configService.get(ConfigKeys.DB_PORT);
  //   console.log(db);
  //   return this.userService.findOne(id);
  // }

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }
}
