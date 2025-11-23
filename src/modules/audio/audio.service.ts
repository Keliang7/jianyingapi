import { Injectable } from '@nestjs/common';
import { FileService } from '@/shared/file/file.service';
import { HttpService } from '@nestjs/axios';
import { parseFile } from 'music-metadata';
import { lastValueFrom } from 'rxjs';
import * as path from 'path';

@Injectable()
export class AudioService {
  constructor(
    private readonly file: FileService,
    private readonly http: HttpService,
  ) {}

  /** 下载音频到指定目录 */
  async downloadToLocal(url: string): Promise<{
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

  /* 
    const createAudioMaterial = () => {
    const audioMaterialPath = path.join(__dirname, "audio.material.json");
    const audioMaterialInfo = JSON.parse(
      fs.readFileSync(audioMaterialPath, "utf-8")
    );
    const baseInfo = {
      id: id,
      name: filename,
      path:
        "##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##/assets/" +
        filename,
    };

    return { ...audioMaterialInfo, ...baseInfo };
  };

  const createAudioTrack = () => {
    const audioTrackPath = path.join(__dirname, "audio.track.json");
    const audioTrackInfo = JSON.parse(fs.readFileSync(audioTrackPath, "utf-8"));

    audioTrackInfo.id = randomUUID();

    const seg = audioTrackInfo.segments[0];
    seg.id = randomUUID();
    seg.material_id = id;
    seg.source_timerange = {
      duration: duration_us,
      start: 0,
    };
    seg.target_timerange = {
      duration: duration_us,
      start: 0,
    };
    seg.volume = 0.3;

    return audioTrackInfo;
  };

  const output = {
    material: createAudioMaterial(),
    track: createAudioTrack(),
  };
  
  */
}
