import { Injectable } from '@nestjs/common';
import {
  SpeechToTextPort,
  SpeechToTextResult,
} from '../../domain/ports/speech-to-text.port';

@Injectable()
export class DevMockSpeechAdapter implements SpeechToTextPort {
  async transcribeChunk(
    audio: Buffer,
    _mimeType: string,
  ): Promise<SpeechToTextResult | null> {
    if (audio.length < 800) {
      return null;
    }
    const kb = Math.round(audio.length / 1024);
    return {
      text: `[dev] Áudio recebido (${kb} KB) — configure STT_BASE_URL para transcrição real.`,
      confidence: 0.5,
      speakerLabel: 'Participante',
    };
  }
}
