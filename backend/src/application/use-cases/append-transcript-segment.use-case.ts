import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TranscriptSegmentEntity } from '../../domain/entities/transcript-segment.entity';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import {
  TRANSCRIPT_REPOSITORY,
  TranscriptRepositoryPort,
} from '../../domain/ports/transcript.repository.port';
import {
  REALTIME_EVENTS_PORT,
  RealtimeEventsPort,
} from '../../domain/ports/realtime-events.port';

export interface AppendTranscriptSegmentInput {
  sessionId: string;
  speakerLabel: string;
  text: string;
  confidence?: number;
  startedAt?: Date;
  endedAt?: Date;
}

@Injectable()
export class AppendTranscriptSegmentUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
    @Inject(TRANSCRIPT_REPOSITORY)
    private readonly transcripts: TranscriptRepositoryPort,
    @Inject(REALTIME_EVENTS_PORT)
    private readonly events: RealtimeEventsPort,
  ) {}

  async execute(input: AppendTranscriptSegmentInput) {
    const session = await this.sessions.findById(input.sessionId);
    if (!session) {
      throw new NotFoundException('Sessão de reunião não encontrada');
    }

    const speakerId = await this.transcripts.upsertSpeaker(
      input.sessionId,
      input.speakerLabel,
    );

    const segment = TranscriptSegmentEntity.create({
      sessionId: input.sessionId,
      speakerId,
      speakerLabel: input.speakerLabel,
      text: input.text,
      confidence: input.confidence,
      startedAt: input.startedAt ?? new Date(),
      endedAt: input.endedAt,
    });

    const saved = await this.transcripts.append(segment);

    this.events.publish({
      type: 'transcript:segment',
      payload: {
        sessionId: saved.sessionId,
        id: saved.id,
        speakerLabel: saved.speakerLabel,
        text: saved.text,
        startedAt: saved.startedAt.toISOString(),
        endedAt: saved.endedAt?.toISOString(),
        confidence: saved.confidence,
      },
    });

    return saved;
  }
}
