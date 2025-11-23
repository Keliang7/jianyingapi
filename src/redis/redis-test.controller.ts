import { Controller, Get, Query } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis-test')
export class RedisTestController {
  constructor(private readonly redis: RedisService) {}

  // 1. ping 一下，看 redis 是否通
  @Get('ping')
  async ping() {
    const pong = await this.redis.ping();
    return { pong };
  }

  @Get('get')
  async get(@Query('key') key: string) {
    const value = await this.redis.get(key);
    return { key, value };
  }

  @Get('set')
  async set(
    @Query('key') key: string,
    @Query('value') value: string,
    @Query('ttl') ttl?: string,
  ) {
    const ttlSeconds = ttl ? parseInt(ttl, 10) : undefined;
    await this.redis.set(key, value, ttlSeconds);
    return { key, value, ttlSeconds };
  }

  @Get('set-json')
  async setJson(
    @Query('key') key: string,
    @Query('value') value: string,
    @Query('ttl') ttl?: string,
  ) {
    const ttlSeconds = ttl ? parseInt(ttl, 10) : undefined;
    await this.redis.set(key, value, ttlSeconds);
    return { key, value, ttlSeconds };
  }
}
