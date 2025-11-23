// redis.module.ts
import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';
import { RedisTestController } from './redis-test.controller';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  imports: [],
  controllers: [RedisTestController],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async () => {
        const url =
          process.env.REDIS_URL || 'redis://:LAq1234567@keliang7.cn:6379';
        const client = createClient({ url });

        client.on('error', (err) => {
          console.error('[Redis] Client Error', err);
        });

        await client.connect();
        console.log('[Redis] connected to', url);

        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
