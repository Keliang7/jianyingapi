```json
{
    "code": 200,
    "message": "success",
    "data": {
        "count": 9,
        "files": [
            "https://translate.google.com/translate_tts?ie=UTF-8&q=%E5%BA%86%E5%8E%86%E5%9B%9B%E5%B9%B4%E6%98%A5%EF%BC%8C&tl=zh-CN&total=1&idx=0&textlen=6&client=tw-ob&prev=input&ttsspeed=1",
            "https://translate.google.com/translate_tts?ie=UTF-8&q=%E6%BB%95%E5%AD%90%E4%BA%AC%E8%B0%AA%E5%AE%88%E5%B7%B4%E9%99%B5%E9%83%A1%E3%80%82&tl=zh-CN&total=1&idx=0&textlen=9&client=tw-ob&prev=input&ttsspeed=1",
            "https://translate.google.com/translate_tts?ie=UTF-8&q=%E8%B6%8A%E6%98%8E%E5%B9%B4%EF%BC%8C&tl=zh-CN&total=1&idx=0&textlen=4&client=tw-ob&prev=input&ttsspeed=1",
            "https://translate.google.com/translate_tts?ie=UTF-8&q=%E6%94%BF%E9%80%9A%E4%BA%BA%E5%92%8C%EF%BC%8C&tl=zh-CN&total=1&idx=0&textlen=5&client=tw-ob&prev=input&ttsspeed=1",
            "https://translate.google.com/translate_tts?ie=UTF-8&q=%E7%99%BE%E5%BA%9F%E5%85%B7%E5%85%B4%EF%BC%8C&tl=zh-CN&total=1&idx=0&textlen=5&client=tw-ob&prev=input&ttsspeed=1",
            "https://translate.google.com/translate_tts?ie=UTF-8&q=%E4%B9%83%E9%87%8D%E4%BF%AE%E5%B2%B3%E9%98%B3%E6%A5%BC%EF%BC%8C&tl=zh-CN&total=1&idx=0&textlen=7&client=tw-ob&prev=input&ttsspeed=1",
            "https://translate.google.com/translate_tts?ie=UTF-8&q=%E5%A2%9E%E5%85%B6%E6%97%A7%E5%88%B6%EF%BC%8C&tl=zh-CN&total=1&idx=0&textlen=5&client=tw-ob&prev=input&ttsspeed=1",
            "https://translate.google.com/translate_tts?ie=UTF-8&q=%E5%88%BB%E5%94%90%E8%B4%A4%E4%BB%8A%E4%BA%BA%E8%AF%97%E8%B5%8B%E4%BA%8E%E5%85%B6%E4%B8%8A%EF%BC%9B&tl=zh-CN&total=1&idx=0&textlen=11&client=tw-ob&prev=input&ttsspeed=1",
            "https://translate.google.com/translate_tts?ie=UTF-8&q=%E5%B1%9E%E4%BA%88%E4%BD%9C%E6%96%87%E4%BB%A5%E8%AE%B0%E4%B9%8B&tl=zh-CN&total=1&idx=0&textlen=7&client=tw-ob&prev=input&ttsspeed=1"
        ]
    },
    "timestamp": "2025-11-24T08:06:12.458Z"
}

---

## 语音合成处理函数（DubbingService 内使用）

下面是用于处理 Google TTS 返回的多段音频 URL 的完整流程示例。

### 1. 分析每段音频并生成 duration timeline

```ts
async buildTimeline(urls: string[]) {
  const results = [];
  for (const url of urls) {
    const parsed = await this.audio.parseAudio(url);
    if (parsed.ok) {
      results.push(parsed);
    }
  }

  let start = 0;
  const timeline = results.map(r => {
    const item = {
      start,
      end: start + r.duration_us,
      fileName: r.fileName,
      filePath: r.filePath,
    };
    start = item.end;
    return item;
  });

  return { timeline, audios: results };
}
```

### 2. 下载到 public/dubbing 目录

```ts
async moveAllToDubbing(draftId: string, audioList: { fileName: string; filePath: string }[]) {
  const output: string[] = [];

  for (const audio of audioList) {
    const oldPath = path.join(process.cwd(), 'public', 'audio', audio.fileName);
    const newPath = path.join(process.cwd(), 'public', 'dubbing', draftId, audio.fileName);
    const { filePath } = await this.file.moveFile(oldPath, newPath);
    output.push(filePath);
  }

  return output;
}
```

### 3. 总流程封装

```ts
async processGoogleDubbing(urls: string[], draftId: string) {
  const { timeline, audios } = await this.buildTimeline(urls);
  const moved = await this.moveAllToDubbing(draftId, audios);

  return {
    timeline,
    files: moved,
    count: moved.length,
  };
}
```
