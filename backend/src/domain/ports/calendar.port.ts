import { MeetingPlatform } from '@meeting-scribe/shared';

export const CALENDAR_PORT = Symbol('CALENDAR_PORT');

export interface CalendarMeetingEvent {
  externalId: string;
  title: string;
  platform: MeetingPlatform;
  joinUrl?: string;
  scheduledStart: Date;
  scheduledEnd?: Date;
}

export interface CalendarPort {
  fetchUpcoming(from: Date, to: Date): Promise<CalendarMeetingEvent[]>;
}
