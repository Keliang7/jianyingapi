import { Injectable } from '@nestjs/common';
import { FileService } from '@/shared/file/file.service';
import { HttpService } from '@nestjs/axios';
import { parseFile } from 'music-metadata';
import { lastValueFrom } from 'rxjs';
import * as path from 'path';
import { ConfigKeys } from 'src/common/constants/config-keys.enum';
import { randomUUID } from 'crypto';

@Injectable()
export class VideoService {
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

    return await this.file.writeStreamToFile('video', filename, response.data);
  }

  /** 解析音频 duration */
  private async getVideoDuration(localPath) {
    const metadata = await parseFile(localPath, { duration: true });

    return {
      duration_s: metadata.format.duration,
      duration_us: Math.floor(metadata.format.duration * 1_000_000),
    };
  }

  /** HEAD 检查 + 下载 + metadata 解析 */
  async parseVideo(url: string): Promise<
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

      if (!contentType || !contentType.startsWith('video/')) {
        return { ok: false, error: '文件不是视频频类型' };
      }

      const MAX_SIZE = 20 * 1024 * 1024;
      if (contentLength > MAX_SIZE) {
        return { ok: false, error: '文件大于 20MB，不允许处理' };
      }

      const { fileName, filePath } = await this.downloadToLocal(url);

      const audioDuration = await this.getVideoDuration(
        path.join(process.cwd(), 'public', filePath),
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

  private async createVideoMaterial(
    id: string,
    filePath: string,
    filename: string,
    duration_us: number,
  ) {
    const materialInfoPath = path.resolve(
      __dirname,
      '../../__templates__/video/video.material.json',
    );
    const materialInfo = await this.file.readJson(materialInfoPath);

    const baseInfo = {
      duration: duration_us,
      id,
      material_name: filename,
      path: ConfigKeys.JIANYING_DIR + '/' + filePath,
      stable: {
        matrix_path: '',
        stable_level: 0,
        time_range: { duration: duration_us, start: 0 },
      },
    };
    return { ...materialInfo, ...baseInfo };
  }

  private async createVideoTrack(material_id: string, duration_us: number) {
    const trackInfoPath = path.resolve(
      __dirname,
      '../../__templates__/video/video.track.json',
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
      volume: 1,
    };

    trackInfo.segments[0] = {
      ...trackInfo.segments[0],
      ...seg,
    };
    return trackInfo;
  }

  private async moveFileToDraftDir(
    draftId: string,
    videoInfo: { filePath: string; fileName: string },
  ) {
    const oldPath = path.join(
      process.cwd(),
      'public',
      'video',
      videoInfo.fileName,
    );

    const newPath = path.join(
      process.cwd(),
      'public',
      'drafts',
      draftId,
      'video',
      videoInfo.fileName,
    );

    console.log(oldPath, newPath);

    const { filePath } = await this.file.moveFile(oldPath, newPath);

    // // filePath 是相对项目根目录的路径
    return filePath;
  }

  async addVideo(
    draftId: string,
    videoInfo: { filePath: string; fileName: string; duration_us: number },
  ) {
    await this.moveFileToDraftDir(draftId, videoInfo);

    const material_id = randomUUID();
    const material = await this.createVideoMaterial(
      material_id,
      videoInfo.filePath,
      videoInfo.fileName,
      videoInfo.duration_us,
    );
    const track = await this.createVideoTrack(
      material_id,
      videoInfo.duration_us,
    );

    const draftInfoPath = path.resolve(
      process.cwd(),
      'public',
      'drafts',
      draftId,
      'draft_info.json',
    );

    const draft_info = await this.file.readJson(draftInfoPath);

    draft_info.materials.videos.push(material);
    draft_info.tracks.push(track);

    console.log(draft_info);

    await this.file.writeJson(draftInfoPath, draft_info);

    return { draftId };
  }
}
