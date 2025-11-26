import { Injectable } from '@nestjs/common';
import { FileService } from '@/shared/file/file.service';
import { DraftService } from '../draft/draft.service';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class TextService {
  constructor(
    private readonly file: FileService,
    private readonly draft: DraftService,
  ) {}

  async addMaterial(
    draft_id: string,
    text: string,
  ): Promise<{
    material_id: string;
  }> {
    const baseMaterialInfoPath = path.resolve(
      __dirname,
      '../../__templates__/text/text.material.json',
    );

    const baseMaterialInfo = await this.file.readJson(baseMaterialInfoPath);
    const textInfo = JSON.parse(baseMaterialInfo.content);
    const material_id = randomUUID();
    baseMaterialInfo.id = material_id;
    textInfo.text = text;
    const content = JSON.stringify(textInfo);
    baseMaterialInfo.content = content;

    const draft_info = await this.draft.getDraft(draft_id);

    draft_info.materials.texts.push(baseMaterialInfo);

    await this.draft.setDraft(draft_id, draft_info);

    return {
      material_id,
    };
  }

  async addTrack(draft_id: string): Promise<{
    track_id: string;
  }> {
    const trackInfoPath = path.resolve(
      __dirname,
      '../../__templates__/track/track.json',
    );

    const trackInfo = await this.file.readJson(trackInfoPath);

    const track_id = randomUUID();

    trackInfo.id = track_id;

    trackInfo.type = 'text';

    const draft_info = await this.draft.getDraft(draft_id);

    draft_info.tracks.push(trackInfo);

    await this.draft.setDraft(draft_id, draft_info);

    return {
      track_id,
    };
  }

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
      '../../__templates__/text/segments.json',
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
}
