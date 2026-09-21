import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SpeechToTextPort,
  SpeechToTextResult,
} from '../../domain/ports/speech-to-text.port';

@Injectable()
export class OpenAiCompatibleWhisperAdapter implements SpeechToTextPort {
  private readonly logger = new Logger(OpenAiCompatibleWhisperAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async transcribeChunk(
    audio: Buffer,
    mimeType: string,
  ): Promise<SpeechToTextResult | null> {
    const baseUrl = this.config.get<string>('STT_BASE_URL');
    if (!baseUrl) {
      this.logger.warn('STT_BASE_URL não configurado — chunk ignorado');
      return null;
    }

    const model = this.config.get<string>('STT_MODEL') ?? 'whisper-1';
    const apiKey = this.config.get<string>('STT_API_KEY') ?? '';

    const extension = mimeType.includes('webm')
      ? 'webm'
      : mimeType.includes('ogg')
        ? 'ogg'
        : 'wav';

    const form = new FormData();
    form.append(
      'file',
      new Blob([Uint8Array.from(audio)], { type: mimeType }),
      `chunk.${extension}`,
    );
    form.append('model', model);
    form.append('language', 'pt');
    form.append('response_format', 'verbose_json');

    const headers: Record<string, string> = {};
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/audio/transcriptions`, {
      method: 'POST',
      headers,
      body: form,
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`STT falhou (${response.status}): ${body}`);
      return null;
    }

    const payload = (await response.json()) as {
      text?: string;
      segments?: Array<{ text: string; avg_logprob?: number; speaker?: string }>;
    };

    const text = payload.text?.trim();
    if (!text) return null;

    const firstSegment = payload.segments?.[0];
    const confidence =
      firstSegment?.avg_logprob !== undefined
        ? Math.min(1, Math.max(0, 1 + firstSegment.avg_logprob))
        : undefined;

    return {
      text,
      confidence,
      speakerLabel: firstSegment?.speaker,
    };
  }
}
