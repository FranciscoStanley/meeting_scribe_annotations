import { Inject, Injectable } from '@nestjs/common';
import {
  CALENDAR_PORT,
  CalendarMeetingEvent,
  CalendarPort,
} from '../../domain/ports/calendar.port';

export const CALENDAR_ADAPTERS = Symbol('CALENDAR_ADAPTERS');

@Injectable()
export class CompositeCalendarAdapter implements CalendarPort {
  constructor(
    @Inject(CALENDAR_ADAPTERS) private readonly adapters: CalendarPort[],
  ) {}

  async fetchUpcoming(from: Date, to: Date): Promise<CalendarMeetingEvent[]> {
    if (!this.adapters.length) return [];
    const batches = await Promise.all(
      this.adapters.map((adapter) => adapter.fetchUpcoming(from, to)),
    );
    const merged = batches.flat();
    const unique = new Map<string, CalendarMeetingEvent>();
    for (const event of merged) {
      unique.set(event.externalId, event);
    }
    return [...unique.values()].sort(
      (a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime(),
    );
  }
}
