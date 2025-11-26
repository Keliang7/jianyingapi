import { Injectable } from '@nestjs/common';
import { FileService } from '@/shared/file/file.service';
import { HttpService } from '@nestjs/axios';
import * as path from 'path';
import { ConfigKeys } from 'src/common/constants/config-keys.enum';
import { randomUUID } from 'crypto';
import { TtsService } from '@/modules/tts/tts.service';
import { AudioService } from '@/modules/audio/audio.service';
import { DraftService } from '../draft/draft.service';

@Injectable()
export class DubbingService {
  constructor(
    private readonly file: FileService,
    private readonly draft: DraftService,
    private readonly http: HttpService,
    private readonly tts: TtsService,
    private readonly audio: AudioService,
  ) {}

  private splitText(
    text: string,
    maxLen = 200,
    removePunctuation = false,
  ): string[] {
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

    const audioResults = [];
    for (const segment of textsArr) {
      const localPath = await this.tts.generateMp3(segment, segment + '.mp3');
      audioResults.push(localPath);
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

  // 生成material
  async addMaterial({ filePath, fileName, draft_id }): Promise<{
    material_id: string;
  }> {
    const baseMaterialInfoPath = path.resolve(
      __dirname,
      '../../__templates__/material/material.json',
    );

    const baseMaterialInfo = await this.file.readJson(baseMaterialInfoPath);
    const material_id = randomUUID();
    const materialInfo = {
      id: material_id,
      name: fileName,
      path: ConfigKeys.JIANYING_DIR + filePath,
    };
    const mergedMaterialInfo = { ...baseMaterialInfo, ...materialInfo };

    const draft_info = await this.draft.getDraft(draft_id);

    draft_info.materials.audios.push(mergedMaterialInfo);

    await this.draft.setDraft(draft_id, draft_info);

    await this.file.moveFile(
      path.resolve(process.cwd(), 'public', 'audio', fileName),
      path.resolve(
        process.cwd(),
        'public',
        'drafts',
        draft_id,
        'audio',
        fileName,
      ),
    );

    return {
      material_id,
    };
  }

  // 生成track
  async addTrack(draft_id): Promise<{
    track_id: string;
  }> {
    const trackInfoPath = path.resolve(
      __dirname,
      '../../__templates__/track/track.json',
    );

    const trackInfo = await this.file.readJson(trackInfoPath);

    const track_id = randomUUID();

    trackInfo.id = track_id;

    const draft_info = await this.draft.getDraft(draft_id);

    draft_info.tracks.push(trackInfo);

    await this.draft.setDraft(draft_id, draft_info);

    return {
      track_id,
    };
  }

  // 生成segment
  async addSegment(
    draft_id,
    track_id,
    material_id,
    fileInfo: { duration_us: number },
  ): Promise<{
    segment_id: string;
  }> {
    const baseSegmentInfoPath = path.resolve(
      __dirname,
      '../../__templates__/segments/segments.json',
    );

    const baseSegmentInfo = await this.file.readJson(baseSegmentInfoPath);

    const draft_info = await this.draft.getDraft(draft_id);

    const track = draft_info.tracks.find((r) => r.id === track_id);

    const lastSegment = track.segments[track.segments.length - 1];

    const start = lastSegment
      ? lastSegment.target_timerange.start +
        lastSegment.target_timerange.duration
      : 0;

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
        start,
      },
    };

    const mergedSegmentInfo = { ...baseSegmentInfo, ...info };

    track.segments.push(mergedSegmentInfo);

    draft_info.duration = fileInfo.duration_us + start;

    await this.draft.setDraft(draft_id, draft_info);

    return {
      segment_id,
    };
  }

  // texts 2 segments
  async texts2Segments(texts: string, draft_id: string) {
    const { track_id } = await this.addTrack(draft_id);
    const { files } = await this.generateAudio(texts);

    for (const file of files) {
      const { material_id } = await this.addMaterial({
        filePath: file.path,
        fileName: file.filename,
        draft_id,
      });

      await this.addSegment(draft_id, track_id, material_id, file);
    }

    return { draft_id };
  }
}
