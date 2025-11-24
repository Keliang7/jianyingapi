// src/tts/tts.service.ts
import { Injectable } from '@nestjs/common';
import { EdgeTTS } from 'node-edge-tts';
import * as path from 'path';
import * as fsp from 'fs/promises';
import { parseFile } from 'music-metadata';

@Injectable()
export class TtsService {
  private readonly voice = 'zh-CN-XiaoyiNeural';
  private readonly format = 'audio-24khz-48kbitrate-mono-mp3';

  /** 解析音频 duration */
  private async getAudioDuration(localPath) {
    const metadata = await parseFile(localPath, { duration: true });

    return {
      duration_s: metadata.format.duration,
      duration_us: Math.floor(metadata.format.duration * 1_000_000),
    };
  }

  async generateMp3(
    text: string,
    filename: string,
  ): Promise<{
    path: string;
    filename: string;
    duration_s: number;
    duration_us: number;
  }> {
    await fsp.mkdir(path.join(process.cwd(), 'public/audio'), {
      recursive: true,
    });

    const fullPath = path.resolve(process.cwd(), 'public/audio', filename);

    const tts = new EdgeTTS({
      voice: this.voice,
      lang: 'zh-CN',
      outputFormat: this.format,
    });

    await tts.ttsPromise(text, fullPath);

    const audioDuration = await this.getAudioDuration(fullPath);

    return {
      filename,
      path: `/audio/${filename}`,
      ...audioDuration,
    };
  }
}
