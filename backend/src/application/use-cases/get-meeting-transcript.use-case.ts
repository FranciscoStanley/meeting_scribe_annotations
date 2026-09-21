import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import {
  TRANSCRIPT_REPOSITORY,
  TranscriptRepositoryPort,
} from '../../domain/ports/transcript.repository.port';

@Injectable()
export class GetMeetingTranscriptUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
    @Inject(TRANSCRIPT_REPOSITORY)
    private readonly transcripts: TranscriptRepositoryPort,
  ) {}

  async execute(sessionId: string) {
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Sessão de reunião não encontrada');
    }
    const segments = await this.transcripts.listBySession(sessionId);
    return {
      session: session.toProps(),
      segments: segments.map((s) => ({
        id: s.id,
        speakerLabel: s.speakerLabel,
        text: s.text,
        startedAt: s.startedAt.toISOString(),
        endedAt: s.endedAt?.toISOString(),
        confidence: s.confidence,
      })),
    };
  }
}
