import { Injectable } from '@nestjs/common';
import { FileService } from '@/shared/file/file.service';
import { HttpService } from '@nestjs/axios';
import { parseFile } from 'music-metadata';
import { lastValueFrom } from 'rxjs';
import * as path from 'path';
import { ConfigKeys } from 'src/common/constants/config-keys.enum';
import { randomUUID } from 'crypto';

@Injectable()
export class AudioService {
  constructor(
    private readonly file: FileService,
    private readonly http: HttpService,
  ) {}

  /** 下载音频到指定目录 */
  private async downloadToLocal(url: string): Promise<{
    filePath: string;
    fileName: string;
  }> {
    const pure = url.split('?')[0].split('/').pop();
    const filename = decodeURIComponent(pure).replace(/\s+/g, '_');

    const response = await lastValueFrom(
      this.http.get(url, { responseType: 'stream' }),
    );

    return await this.file.writeStreamToFile('audio', filename, response.data);
  }

  /** 解析音频 duration */
  private async getAudioDuration(localPath) {
    const metadata = await parseFile(localPath, { duration: true });

    return {
      duration_s: metadata.format.duration,
      duration_us: Math.floor(metadata.format.duration * 1_000_000),
    };
  }

  /** HEAD 检查 + 下载 + metadata 解析 */
  async parseAudio(url: string): Promise<
    | {
        ok: true;
        fileName: string;
        filePath: string;
        duration_s: number;
        duration_us: number;
      }
    | { ok: false; error: string }
  > {
    try {
      const head = await lastValueFrom(
        this.http.head(url, { validateStatus: () => true }),
      );
      const contentType = head.headers['content-type'];
      const contentLength = Number(head.headers['content-length'] || 0);

      if (!contentType || !contentType.startsWith('audio/')) {
        return { ok: false, error: '文件不是音频类型' };
      }

      const MAX_SIZE = 20 * 1024 * 1024;
      if (contentLength > MAX_SIZE) {
        return { ok: false, error: '文件大于 20MB，不允许处理' };
      }

      const { fileName, filePath } = await this.downloadToLocal(url);

      const audioDuration = await this.getAudioDuration(
        path.join(process.cwd(), filePath),
      );

      return {
        ok: true,
        fileName,
        filePath,
        ...audioDuration,
      };
    } finally {
      console.log('finally');
    }
  }

  private async createAudioMaterial(
    id: string,
    filePath: string,
    filename: string,
  ) {
    const materialInfoPath = path.resolve(
      __dirname,
      '../../__templates__/audio/audio.material.json',
    );
    const materialInfo = await this.file.readJson(materialInfoPath);

    const baseInfo = {
      id,
      name: filename,
      path: ConfigKeys.JIANYING_DIR + filePath,
    };
    return { ...materialInfo, ...baseInfo };
  }

  private async createAudioTrack(material_id: string, duration_us: number) {
    const trackInfoPath = path.resolve(
      __dirname,
      '../../__templates__/audio/audio.track.json',
    );

    const trackInfo = await this.file.readJson(trackInfoPath);

    const seg = {
      id: randomUUID(),
      material_id,
      source_timerange: {
        duration: duration_us,
        start: 0,
      },
      target_timerange: {
        duration: duration_us,
        start: 0,
      },
      volume: 0.3,
    };

    trackInfo.segments[0] = {
      ...trackInfo.segments[0],
      ...seg,
    };
    return trackInfo;
  }

  private async moveFileToDraftDir(
    draftId: string,
    audioInfo: { filePath: string; fileName: string },
  ) {
    const destPath = `/public/drafts/${draftId}/audio/${audioInfo.fileName}`;
    await this.file.moveFile(audioInfo.filePath, destPath);
    return destPath;
  }

  async addAudio(
    draftId: string,
    audioInfo: { filePath: string; fileName: string; duration_us: number },
  ) {
    const material_id = randomUUID();
    const material = await this.createAudioMaterial(
      material_id,
      audioInfo.filePath,
      audioInfo.fileName,
    );
    const track = await this.createAudioTrack(
      material_id,
      audioInfo.duration_us,
    );

    return { draftId };
  }
}
