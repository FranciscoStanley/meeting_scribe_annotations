import { assertMeetingSchedule as assertShared } from '@meeting-scribe/shared';

/** Valida início/fim da agenda (domínio → shared). */
export function assertMeetingSchedule(
  scheduledStart: Date,
  scheduledEnd?: Date,
): void {
  assertShared(scheduledStart, scheduledEnd, { rejectPastStart: false });
}
