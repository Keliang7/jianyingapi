import { Injectable } from '@nestjs/common';
import { FileService } from '@/shared/file/file.service';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class DraftService {
  constructor(private readonly file: FileService) {}

  async createDraft(width = 1080, height = 1920) {
    const draftInfoPath = path.resolve(
      __dirname,
      '../../__templates__/draft/draft_info.json',
    );
    const draftInfo = await this.file.readJson(draftInfoPath);

    console.log(draftInfo);

    draftInfo.canvas_config.width = width;
    draftInfo.canvas_config.height = height;

    return draftInfo;
  }

  async createDraftMeta(folderName = 'test_dir') {
    const draftMetaPath = path.resolve(
      __dirname,
      '../../__templates___/draft/draft_meta_info.json',
    );

    const draftMeta = await this.file.readJson(draftMetaPath);

    draftMeta.draft_fold_path = `/Users/sthz123/Movies/JianyingPro/User Data/Projects/com.lveditor.draft/${folderName}`;

    draftMeta.draft_id = randomUUID();
    draftMeta.draft_name = folderName;
    draftMeta.draft_timeline_materials_size_ = 0;
    draftMeta.tm_draft_modified = `${Date.now()}000`;
    draftMeta.tm_duration = 0;

    return draftMeta;
  }
}
