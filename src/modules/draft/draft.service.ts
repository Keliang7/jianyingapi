import { Injectable } from '@nestjs/common';
import { FileService } from '@/shared/file/file.service';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class DraftService {
  constructor(private readonly file: FileService) {}

  private async createDraftInfo(draftId: string, width = 1080, height = 1920) {
    const draftInfoPath = path.resolve(
      __dirname,
      '../../__templates__/draft/draft_info.json',
    );
    const draftInfo = await this.file.readJson(draftInfoPath);

    draftInfo.canvas_config.width = width;
    draftInfo.canvas_config.height = height;

    const baseDir = path.resolve(process.cwd(), 'public/drafts', draftId);
    const outputPath = path.join(baseDir, 'draft_info.json');
    await this.file.writeJson(outputPath, draftInfo);
  }

  private async createDraftMetaInfo(draftId: string) {
    const draftMetaPath = path.resolve(
      __dirname,
      '../../__templates__/draft/draft_meta_info.json',
    );

    const draftMeta = await this.file.readJson(draftMetaPath);

    draftMeta.draft_fold_path = `/Users/sthz123/Movies/JianyingPro/User Data/Projects/com.lveditor.draft/${draftId}`;

    draftMeta.draft_id = draftId;
    draftMeta.draft_name = draftId;
    draftMeta.draft_timeline_materials_size_ = 0;
    draftMeta.tm_draft_modified = `${Date.now()}000`;
    draftMeta.tm_duration = 0;

    const baseDir = path.resolve(process.cwd(), 'public/drafts', draftId);
    const outputPath = path.join(baseDir, 'draft_meta_info.json');
    await this.file.writeJson(outputPath, draftMeta);
  }

  async createDraft(width = 1080, height = 1920) {
    const draftId = randomUUID();
    await this.createDraftInfo(draftId, width, height);
    await this.createDraftMetaInfo(draftId);
    return { draftId };
  }
}
