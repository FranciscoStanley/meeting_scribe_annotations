import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import { ExpirePastMeetingsUseCase } from './expire-past-meetings.use-case';

@Injectable()
export class GetMeetingUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
    private readonly expirePast: ExpirePastMeetingsUseCase,
  ) {}

  async execute(id: string) {
    const found = await this.sessions.findById(id);
    if (!found) {
      throw new NotFoundException('Reunião não encontrada');
    }
    const session = await this.expirePast.expireIfNeeded(found);
    const props = session.toProps();
    return {
      ...props,
      scheduledStart: props.scheduledStart.toISOString(),
      scheduledEnd: props.scheduledEnd?.toISOString(),
      startedAt: props.startedAt?.toISOString(),
      endedAt: props.endedAt?.toISOString(),
      alertSentAt: props.alertSentAt?.toISOString(),
      canModify: session.canModify(),
    };
  }
}
