import { Injectable } from '@nestjs/common';
import * as fsp from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileService {
  async readJson(filePath: string) {
    const json = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(json);
  }

  async writeJson(filePath: string, obj: any) {
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    return fsp.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf8');
  }
}
