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

  async writeStreamToFile(
    fileType: 'audio' | 'video' | 'image' | 'other',
    fileName: string,
    stream: NodeJS.ReadableStream,
  ): Promise<{
    filePath: string;
    fileName: string;
  }> {
    const targetPath = path.resolve(process.cwd(), 'public'); // 找到 public 目录

    await fsp.mkdir(path.join(targetPath, fileType), { recursive: true }); // 创建文件夹

    const fs = await import('fs');
    return await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(
        path.join(targetPath, fileType, fileName),
      );
      stream.pipe(writer);
      writer.on('finish', () =>
        resolve({
          filePath: path.join(fileType, fileName),
          fileName,
        }),
      );
      writer.on('error', reject);
    });
  }

  async moveFile(
    oldPath: string,
    newPath: string,
  ): Promise<{
    filePath: string;
    fileName: string;
  }> {
    await fsp.mkdir(path.dirname(newPath), { recursive: true });
    await fsp.rename(oldPath, newPath);
    return {
      filePath: newPath.replace(process.cwd(), ''),
      fileName: path.basename(newPath),
    };
  }
}
