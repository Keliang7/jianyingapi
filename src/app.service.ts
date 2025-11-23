import { Injectable } from '@nestjs/common';

@Injectable() // 表示这个类是一个服务，可以被注入到其他类中
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
