import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  SpeechToTextPort,
  SpeechToTextResult,
} from '../../domain/ports/speech-to-text.port';

type Transcriber = (
  audio: string | Float32Array,
  options?: Record<string, unknown>,
) => Promise<{ text: string } | { text: string }[]>;

@Injectable()
export class LocalWhisperAdapter implements SpeechToTextPort, OnModuleInit {
  private readonly logger = new Logger(LocalWhisperAdapter.name);
  private transcriber: Transcriber | null = null;
  private loading: Promise<void> | null = null;
  private ready = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    // Pré-carrega o modelo em background para a 1ª reunião já transcrever
    void this.ensureReady();
  }

  async transcribeChunk(
    audio: Buffer,
    mimeType: string,
  ): Promise<SpeechToTextResult | null> {
    if (audio.length < 800) {
      this.logger.debug(`Chunk muito pequeno ignorado (${audio.length} bytes)`);
      return null;
    }

    try {
      await this.ensureReady();
      if (!this.transcriber) return null;

      const wavPath = await this.toWavFile(audio, mimeType);
      try {
        const output = await this.transcriber(wavPath, {
          language: 'portuguese',
          task: 'transcribe',
        });
        const text = Array.isArray(output)
          ? output.map((o) => o.text).join(' ').trim()
          : output.text?.trim();

        if (!text || text.length < 2) return null;

        // Filtra alucinações comuns do Whisper em silêncio
        const lower = text.toLowerCase();
        if (
          lower.includes('legendas pela comunidade') ||
          lower.includes('amara.org') ||
          lower === 'obrigado.' ||
          lower === 'thanks for watching.'
        ) {
          return null;
        }

        return {
          text,
          confidence: 0.75,
          speakerLabel: 'Participante',
        };
      } finally {
        await fs.unlink(wavPath).catch(() => undefined);
      }
    } catch (error) {
      this.logger.error(
        `Falha na transcrição local (${audio.length} bytes, ${mimeType})`,
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  private async ensureReady() {
    if (this.ready && this.transcriber) return;
    if (this.loading) return this.loading;

    this.loading = (async () => {
      const model =
        this.config.get<string>('STT_LOCAL_MODEL') ?? 'Xenova/whisper-tiny';
      this.logger.log(
        `Carregando Whisper local (${model}) — primeira vez pode baixar ~75MB…`,
      );

      const { pipeline } = await import('@xenova/transformers');
      this.transcriber = (await pipeline(
        'automatic-speech-recognition',
        model,
      )) as Transcriber;
      this.ready = true;
      this.logger.log('Whisper local pronto para transcrição.');
    })().catch((error) => {
      this.loading = null;
      this.logger.error('Não foi possível carregar Whisper local', error);
      throw error;
    });

    return this.loading;
  }

  private async toWavFile(audio: Buffer, mimeType: string): Promise<string> {
    const ffmpeg = await this.resolveFfmpeg();
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ms-stt-'));
    const ext = mimeType.includes('ogg')
      ? 'ogg'
      : mimeType.includes('wav')
        ? 'wav'
        : 'webm';
    const input = path.join(dir, `in.${ext}`);
    const output = path.join(dir, 'out.wav');
    await fs.writeFile(input, audio);

    await new Promise<void>((resolve, reject) => {
      const child = spawn(
        ffmpeg,
        ['-y', '-i', input, '-ar', '16000', '-ac', '1', '-f', 'wav', output],
        { windowsHide: true },
      );
      let stderr = '';
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg saiu com ${code}: ${stderr.slice(-400)}`));
      });
    });

    await fs.unlink(input).catch(() => undefined);
    return output;
  }

  private async resolveFfmpeg(): Promise<string> {
    try {
      const mod = await import('ffmpeg-static');
      const bin = (mod as { default?: string }).default ?? (mod as unknown as string);
      if (bin) return bin;
    } catch {
      // fallback PATH
    }
    return 'ffmpeg';
  }
}
