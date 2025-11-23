import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly client: RedisClientType,
  ) {}

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, value, { EX: ttlSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<any> {
    return await this.client.get(key);
  }

  async setJson<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(data);
    await this.set(key, payload, ttlSeconds);
  }

  // async getJson<T>(key: string): Promise<T | null> {
  //   const raw = await this.get(key);
  //   if (!raw) return null;
  //   try {
  //     return JSON.parse(raw) as T;
  //   } catch {
  //     return null;
  //   }
  // }
}
