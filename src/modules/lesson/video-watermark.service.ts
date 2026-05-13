import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg') as { path: string };

/** Chuỗi burn-in cố định — nằm trong pixel file, vẫn thấy khi tải về */
export const BURN_IN_WATERMARK_TEXT = 'Khóa học autoreg';

@Injectable()
export class VideoWatermarkService {
  private readonly logger = new Logger(VideoWatermarkService.name);
  private readonly ffmpegPath = ffmpegInstaller.path;

  /** Đường dẫn dùng trong filter drawtext (escape ổ Windows) */
  private escapeDrawtextFilePath(absPath: string): string {
    const unixish = absPath.replace(/\\/g, '/');
    return unixish.replace(/^([a-zA-Z]):\//, '$1\\:/');
  }

  private resolveFontPath(): string | null {
    const candidates = [
      process.env.WINDIR ? join(process.env.WINDIR, 'Fonts', 'arial.ttf') : '',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/Library/Fonts/Arial.ttf',
    ].filter(Boolean);
    for (const c of candidates) {
      if (existsSync(c)) return c;
    }
    return null;
  }

  private async fileHasAudioStream(inputPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      const p = spawn(this.ffmpegPath, ['-hide_banner', '-i', inputPath], {
        stdio: ['ignore', 'ignore', 'pipe'],
      });
      let err = '';
      p.stderr?.on('data', (c: Buffer) => {
        err += c.toString();
      });
      p.on('close', () => resolve(err.includes('Audio:')));
      p.on('error', () => resolve(false));
    });
  }

  private runFfmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const p = spawn(this.ffmpegPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let err = '';
      p.stderr?.on('data', (c: Buffer) => {
        err += c.toString();
      });
      p.on('error', (e) => reject(e));
      p.on('close', (code) => {
        if (code === 0) resolve();
        else {
          const tail = err.trim().slice(-2500);
          reject(new Error(tail || `ffmpeg thoát mã ${code}`));
        }
      });
    });
  }

  /**
   * Ghi watermark burn-in (góc dưới phải), xuất MP4 H.264 + AAC (hoặc không audio).
   */
  async burnFixedWatermark(inputPath: string, outputPath: string): Promise<void> {
    const textFile = join(tmpdir(), `autoreg-wm-${randomUUID()}.txt`);
    writeFileSync(textFile, BURN_IN_WATERMARK_TEXT, { encoding: 'utf8' });

    const fontPath = this.resolveFontPath();
    const tf = this.escapeDrawtextFilePath(textFile);
    const drawBase =
      `fontsize=11:fontcolor=white@0.88:borderw=1:bordercolor=black@0.5:x=w-text_w-12:y=h-text_h-10`;
    const vf = fontPath
      ? `drawtext=fontfile='${this.escapeDrawtextFilePath(fontPath)}':textfile='${tf}':${drawBase}`
      : `drawtext=textfile='${tf}':${drawBase}`;

    const hasAudio = await this.fileHasAudioStream(inputPath);
    const args = [
      '-y',
      '-i',
      inputPath,
      '-vf',
      vf,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-movflags',
      '+faststart',
    ];
    if (hasAudio) {
      args.push('-c:a', 'aac', '-b:a', '128k');
    } else {
      args.push('-an');
    }
    args.push(outputPath);

    this.logger.log(`ffmpeg burn-in: ${inputPath} -> ${outputPath}`);

    try {
      await this.runFfmpeg(args);
    } finally {
      try {
        unlinkSync(textFile);
      } catch {
        /* ignore */
      }
    }
  }
}
