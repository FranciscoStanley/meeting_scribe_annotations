import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';

@Injectable()
export class GetMeetingUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
  ) {}

  async execute(id: string) {
    const session = await this.sessions.findById(id);
    if (!session) {
      throw new NotFoundException('Reunião não encontrada');
    }
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
