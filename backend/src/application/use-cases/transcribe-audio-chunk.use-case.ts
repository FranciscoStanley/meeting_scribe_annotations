import { Inject, Injectable } from '@nestjs/common';
import {
  SPEECH_TO_TEXT_PORT,
  SpeechToTextPort,
} from '../../domain/ports/speech-to-text.port';
import { AppendTranscriptSegmentUseCase } from './append-transcript-segment.use-case';

@Injectable()
export class TranscribeAudioChunkUseCase {
  private readonly lastSpeakerBySession = new Map<string, string>();

  constructor(
    @Inject(SPEECH_TO_TEXT_PORT) private readonly stt: SpeechToTextPort,
    private readonly appendSegment: AppendTranscriptSegmentUseCase,
  ) {}

  async execute(sessionId: string, audio: Buffer, mimeType: string) {
    const result = await this.stt.transcribeChunk(audio, mimeType);
    if (!result?.text?.trim()) {
      return null;
    }

    const fallback =
      this.lastSpeakerBySession.get(sessionId) ?? 'Participante';
    const speakerLabel = result.speakerLabel?.trim() || fallback;
    this.lastSpeakerBySession.set(sessionId, speakerLabel);

    return this.appendSegment.execute({
      sessionId,
      speakerLabel,
      text: result.text,
      confidence: result.confidence,
    });
  }
}
