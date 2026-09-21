import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SPEECH_TO_TEXT_PORT } from '../domain/ports/speech-to-text.port';
import { REALTIME_EVENTS_PORT } from '../domain/ports/realtime-events.port';
import { OpenAiCompatibleWhisperAdapter } from '../infrastructure/speech/openai-compatible-whisper.adapter';
import { LocalWhisperAdapter } from '../infrastructure/speech/local-whisper.adapter';
import { DevMockSpeechAdapter } from '../infrastructure/speech/dev-mock-speech.adapter';
import { InMemoryRealtimeEventsAdapter } from '../infrastructure/realtime/in-memory-realtime-events.adapter';
import { AppendTranscriptSegmentUseCase } from '../application/use-cases/append-transcript-segment.use-case';
import { TranscribeAudioChunkUseCase } from '../application/use-cases/transcribe-audio-chunk.use-case';
import { TranscriptionGateway } from '../presentation/websocket/transcription.gateway';
import { MeetingsModule } from './meetings.module';

@Module({
  imports: [MeetingsModule],
  providers: [
    AppendTranscriptSegmentUseCase,
    TranscribeAudioChunkUseCase,
    TranscriptionGateway,
    OpenAiCompatibleWhisperAdapter,
    LocalWhisperAdapter,
    DevMockSpeechAdapter,
    {
      provide: SPEECH_TO_TEXT_PORT,
      useFactory: (
        config: ConfigService,
        remote: OpenAiCompatibleWhisperAdapter,
        local: LocalWhisperAdapter,
        mock: DevMockSpeechAdapter,
      ) => {
        if (config.get('STT_BASE_URL')) return remote;
        if (config.get('STT_PROVIDER') === 'mock') return mock;
        return local;
      },
      inject: [
        ConfigService,
        OpenAiCompatibleWhisperAdapter,
        LocalWhisperAdapter,
        DevMockSpeechAdapter,
      ],
    },
    InMemoryRealtimeEventsAdapter,
    {
      provide: REALTIME_EVENTS_PORT,
      useExisting: InMemoryRealtimeEventsAdapter,
    },
  ],
  exports: [REALTIME_EVENTS_PORT, AppendTranscriptSegmentUseCase],
})
export class TranscriptionModule {}
