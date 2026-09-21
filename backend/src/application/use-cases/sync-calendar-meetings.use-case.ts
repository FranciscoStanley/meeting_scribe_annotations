import { Inject, Injectable } from '@nestjs/common';
import {
  CALENDAR_PORT,
  CalendarPort,
} from '../../domain/ports/calendar.port';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import { MeetingSessionEntity } from '../../domain/entities/meeting-session.entity';
import { PlatformDetectorService } from '../../domain/services/platform-detector.service';

@Injectable()
export class SyncCalendarMeetingsUseCase {
  constructor(
    @Inject(CALENDAR_PORT) private readonly calendar: CalendarPort,
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
    private readonly platformDetector: PlatformDetectorService,
  ) {}

  async execute(from: Date, to: Date): Promise<number> {
    const events = await this.calendar.fetchUpcoming(from, to);
    let synced = 0;

    for (const event of events) {
      const existing = await this.sessions.findByExternalId(event.externalId);
      if (existing) continue;

      const platform =
        event.platform !== 'OTHER'
          ? event.platform
          : this.platformDetector.detect(event.title, event.joinUrl);

      const session = MeetingSessionEntity.create({
        externalId: event.externalId,
        title: event.title,
        platform,
        scheduledStart: event.scheduledStart,
        scheduledEnd: event.scheduledEnd,
        joinUrl: event.joinUrl,
      });
      await this.sessions.save(session);
      synced += 1;
    }

    return synced;
  }
}
