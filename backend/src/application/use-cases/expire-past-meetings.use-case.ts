import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import { MeetingSessionEntity } from '../../domain/entities/meeting-session.entity';

@Injectable()
export class ExpirePastMeetingsUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
    private readonly config: ConfigService,
  ) {}

  private defaultDurationMinutes(): number {
    return Number(this.config.get('MEETING_DEFAULT_DURATION_MINUTES') ?? 60);
  }

  /** Encerra uma sessão se início e fim efetivo já passaram. */
  async expireIfNeeded(
    session: MeetingSessionEntity,
    now = new Date(),
  ): Promise<MeetingSessionEntity> {
    if (!session.shouldAutoComplete(now, this.defaultDurationMinutes())) {
      return session;
    }
    return this.sessions.save(session.complete(now));
  }

  async execute(now = new Date()): Promise<number> {
    const open = await this.sessions.findOpen();
    let closed = 0;
    for (const session of open) {
      const before = session.status;
      const updated = await this.expireIfNeeded(session, now);
      if (before !== 'COMPLETED' && updated.status === 'COMPLETED') {
        closed += 1;
      }
    }
    return closed;
  }
}
