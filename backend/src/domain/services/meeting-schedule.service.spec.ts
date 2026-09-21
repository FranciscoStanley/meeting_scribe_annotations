import { describe, expect, it } from 'vitest';
import { assertMeetingSchedule } from './meeting-schedule.service';

describe('assertMeetingSchedule', () => {
  const start = new Date('2026-09-22T18:00:00.000Z');

  it('aceita só início', () => {
    expect(() => assertMeetingSchedule(start)).not.toThrow();
  });

  it('aceita fim posterior ao início', () => {
    expect(() =>
      assertMeetingSchedule(start, new Date('2026-09-22T19:00:00.000Z')),
    ).not.toThrow();
  });

  it('rejeita fim igual ou anterior ao início', () => {
    expect(() => assertMeetingSchedule(start, start)).toThrow(/posterior/);
    expect(() =>
      assertMeetingSchedule(start, new Date('2026-09-22T17:00:00.000Z')),
    ).toThrow(/posterior/);
  });

  it('rejeita data inválida', () => {
    expect(() => assertMeetingSchedule(new Date('invalid'))).toThrow(/início/);
  });
});
