import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import {
  TRANSCRIPT_REPOSITORY,
  TranscriptRepositoryPort,
} from '../../domain/ports/transcript.repository.port';
import { ExpirePastMeetingsUseCase } from './expire-past-meetings.use-case';

@Injectable()
export class GetMeetingTranscriptUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
    @Inject(TRANSCRIPT_REPOSITORY)
    private readonly transcripts: TranscriptRepositoryPort,
    private readonly expirePast: ExpirePastMeetingsUseCase,
  ) {}

  async execute(sessionId: string) {
    const found = await this.sessions.findById(sessionId);
    if (!found) {
      throw new NotFoundException('Sessão de reunião não encontrada');
    }
    const session = await this.expirePast.expireIfNeeded(found);
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
