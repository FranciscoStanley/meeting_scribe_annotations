import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import {
  REALTIME_EVENTS_PORT,
  RealtimeEventsPort,
} from '../../domain/ports/realtime-events.port';

@Injectable()
export class ProcessMeetingAlertsUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
    @Inject(REALTIME_EVENTS_PORT)
    private readonly events: RealtimeEventsPort,
    private readonly config: ConfigService,
  ) {}

  async execute(now = new Date()): Promise<number> {
    const leadMinutes = Number(
      this.config.get('MEETING_ALERT_MINUTES') ?? 3,
    );
    const horizon = new Date(now.getTime() + leadMinutes * 60_000);
    const upcoming = await this.sessions.findUpcoming(now, horizon);
    let alerts = 0;

    for (const session of upcoming) {
      if (!session.shouldAlert(now, leadMinutes)) continue;

      const updated = session.markAlertSent(now);
      await this.sessions.save(updated);

      const startsInMinutes = Math.max(
        0,
        Math.round(
          (session.scheduledStart.getTime() - now.getTime()) / 60_000,
        ),
      );

      this.events.publish({
        type: 'meeting:starting',
        payload: {
          sessionId: session.id,
          title: session.title,
          platform: session.platform,
          joinUrl: session.joinUrl,
          startsInMinutes,
        },
      });
      alerts += 1;
    }

    return alerts;
  }
}
