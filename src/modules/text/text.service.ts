import { Injectable } from '@nestjs/common';
import { FileService } from '@/shared/file/file.service';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class TextService {
  constructor(private readonly file: FileService) {}

  async createTextMaterial(id: string, text: string) {
    const materialInfoPath = path.resolve(
      __dirname,
      '../../__templates__/text/text.material.json',
    );
    const materialInfo = await this.file.readJson(materialInfoPath);
    const textInfo = JSON.parse(materialInfo.content);
    textInfo.text = text;
    const content = JSON.stringify(textInfo);

    const baseInfo = {
      id,
      content,
    };

    return {
      ...materialInfo,
      ...baseInfo,
    };
  }

  private async createTextTrack(
    material_id: string,
    timeLine: { start: number; end: number },
  ) {
    const trackInfoPath = path.resolve(
      __dirname,
      '../../__templates__/text/text.track.json',
    );

    const trackInfo = await this.file.readJson(trackInfoPath);

    const seg = {
      id: randomUUID(),
      material_id,
      source_timerange: {
        duration: timeLine.end - timeLine.start,
        start: timeLine.start,
      },
      target_timerange: {
        duration: timeLine.end - timeLine.start,
        start: timeLine.start,
      },
    };

    trackInfo.segments[0] = {
      ...trackInfo.segments[0],
      ...seg,
    };

    const baseInfo = {
      id: randomUUID(),
    };
    return {
      ...trackInfo,
      ...baseInfo,
    };
  }

  async addText(
    draftId: string,
    text: string,
    timeLine: { start: number; end: number },
  ) {
    const material_id = randomUUID();
    const material = await this.createTextMaterial(material_id, text);
    const track = await this.createTextTrack(material_id, timeLine);

    const draftInfoPath = path.resolve(
      process.cwd(),
      'public',
      'drafts',
      draftId,
      'draft_info.json',
    );

    const draft_info = await this.file.readJson(draftInfoPath);

    draft_info.materials.texts.push(material);
    draft_info.tracks.push(track);

    await this.file.writeJson(draftInfoPath, draft_info);

    return { draftId };
  }
}
