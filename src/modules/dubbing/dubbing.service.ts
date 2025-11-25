import { Injectable } from '@nestjs/common';
import { FileService } from '@/shared/file/file.service';
import { HttpService } from '@nestjs/axios';
import { parseFile } from 'music-metadata';
import { lastValueFrom } from 'rxjs';
import * as path from 'path';
import { ConfigKeys } from 'src/common/constants/config-keys.enum';
import { randomUUID } from 'crypto';
import { TtsService } from '@/modules/tts/tts.service';
import { AudioService } from '@/modules/audio/audio.service';
import * as https from 'node:https';

@Injectable()
export class DubbingService {
  constructor(
    private readonly file: FileService,
    private readonly http: HttpService,
    private readonly tts: TtsService,
    private readonly audio: AudioService,
  ) {}

  /**
   * 将一段文本按标点或长度分割成多段
   */
  splitText(text: string, maxLen = 200, removePunctuation = false): string[] {
    if (!text || typeof text !== 'string') return [];

    const punctuations = /[，。！!？?、；;]/g;
    const parts: string[] = [];

    let buffer = '';

    for (const char of text) {
      buffer += char;

      const isPunct = punctuations.test(char);
      const isLong = buffer.length >= maxLen;

      if (isPunct || isLong) {
        parts.push(buffer.trim());
        buffer = '';
      }
    }

    if (buffer.length > 0) {
      parts.push(buffer.trim());
    }

    if (removePunctuation) {
      return parts.map((seg) => seg.replace(punctuations, '').trim());
    }

    return parts;
  }

  async generateAudio(texts: string) {
    const textsArr = this.splitText(texts, 200, true);

    // 根据分段生成多个音频
    const audioResults = [];
    for (const segment of textsArr) {
      // 调用 TTS 服务生成音频
      const localPath = await this.tts.generateMp3(segment, segment + '.mp3');
      audioResults.push(localPath); // 假设返回的是 { url, file }
    }

    return {
      count: audioResults.length,
      files: audioResults,
    };
  }

  async buildTimeline(
    fileInfos: {
      path: string;
      duration_s: number;
      duration_us: number;
    }[],
  ) {
    let start = 0;
    const timeline = fileInfos.map((r) => {
      const item = {
        start,
        end: start + r.duration_us,
        // fileName: r.fileName,
        // filePath: r.filePath,
      };
      start = item.end;
      return item;
    });

    return { timeline };
  }

  // 先生成material
  // 再生成一个track
  // track里面有一个segment对应material
  async addDubbing(
    draftId: string,
    audioInfos: { filePath: string; fileName: string; duration_us: number }[],
  ) {
    const materials = [];
    const materialTemplatePath = path.resolve(
      __dirname,
      '../../__templates__/audio/audio.material.json',
    );
    const materialInfoTemplate = await this.file.readJson(materialTemplatePath);

    const trackInfoTemplatePath = path.resolve(
      __dirname,
      '../../__templates__/audio/audio.track.json',
    );
    const trackInfoTemplate = await this.file.readJson(trackInfoTemplatePath);
  }

  // 生成material
  async addMaterial({ filePath, fileName, draftId }): Promise<{
    material_id: string;
  }> {
    const baseMaterialInfoPath = path.resolve(
      __dirname,
      '../../__templates__/audio/audio.material.json',
    );

    const baseMaterialInfo = await this.file.readJson(baseMaterialInfoPath);
    const material_id = randomUUID();
    const materialInfo = {
      id: material_id,
      name: fileName,
      path: ConfigKeys.JIANYING_DIR + '/' + filePath,
    };
    const mergedMaterialInfo = { ...baseMaterialInfo, ...materialInfo };

    const draftInfoPath = path.resolve(
      process.cwd(),
      'public',
      'drafts',
      draftId,
      'draft_info.json',
    );
    const draft_info = await this.file.readJson(draftInfoPath);

    draft_info.materials.audios.push(mergedMaterialInfo);

    await this.file.writeJson(draftInfoPath, draft_info);

    return {
      material_id,
    };
  }

  // 生成track
  async addTrack(draftId): Promise<{
    track_id: string;
  }> {
    const trackInfoPath = path.resolve(
      __dirname,
      '../../__templates__/audio/audio.track.json',
    );

    const trackInfo = await this.file.readJson(trackInfoPath);

    const track_id = randomUUID();

    trackInfo.id = track_id;

    const draftInfoPath = path.resolve(
      process.cwd(),
      'public',
      'drafts',
      draftId,
      'draft_info.json',
    );

    const draft_info = await this.file.readJson(draftInfoPath);

    draft_info.tracks.push(trackInfo);

    await this.file.writeJson(draftInfoPath, draft_info);

    return {
      track_id,
    };
  }

  // 生成segment
  async addSegment(
    draftId,
    trackId,
    material_id,
    fileInfo: { duration_us: number },
  ): Promise<{
    segment_id: string;
  }> {
    const baseSegmentInfoPath = path.resolve(
      __dirname,
      '../../__templates__/audio/audio.track.json',
    );

    const baseSegmentInfo = await this.file.readJson(baseSegmentInfoPath);

    const draftInfoPath = path.resolve(
      process.cwd(),
      'public',
      'drafts',
      draftId,
      'draft_info.json',
    );

    const draft_info = await this.file.readJson(draftInfoPath);

    const track = draft_info.tracks.find((r) => r.id === trackId);

    const lastSegment = track.segments[track.segments.length - 1];

    const segment_id = randomUUID();
    const info = {
      id: segment_id,
      material_id,
      source_timerange: {
        duration: fileInfo.duration_us,
        start: 0,
      },
      target_timerange: {
        duration: fileInfo.duration_us,
        start: lastSegment.start + lastSegment.duration,
      },
    };

    const mergedSegmentInfo = { ...baseSegmentInfo, ...info };

    track.segments.push(mergedSegmentInfo);

    await this.file.writeJson(draftInfoPath, draft_info);

    return {
      segment_id,
    };
  }
}
