import { describe, expect, it } from 'vitest';
import {
  assertMeetingSchedule,
  parseScheduleDate,
  validateMeetingSchedule,
} from './meeting-schedule';

describe('parseScheduleDate', () => {
  it('aceita Date e ISO', () => {
    const d = new Date('2026-09-22T18:00:00.000Z');
    expect(parseScheduleDate(d)?.toISOString()).toBe(d.toISOString());
    expect(parseScheduleDate(d.toISOString())?.toISOString()).toBe(
      d.toISOString(),
    );
  });

  it('retorna null para vazio ou inválido', () => {
    expect(parseScheduleDate('')).toBeNull();
    expect(parseScheduleDate(null)).toBeNull();
    expect(parseScheduleDate('não-é-data')).toBeNull();
  });
});

describe('validateMeetingSchedule', () => {
  const now = new Date('2026-09-21T12:00:00.000Z');

  it('exige início válido', () => {
    expect(validateMeetingSchedule({ scheduledStart: '', now }).ok).toBe(false);
  });

  it('rejeita fim anterior ou igual ao início', () => {
    const start = '2026-09-22T18:00:00.000Z';
    expect(
      validateMeetingSchedule({
        scheduledStart: start,
        scheduledEnd: start,
        now,
        rejectPastStart: false,
      }).ok,
    ).toBe(false);
    expect(
      validateMeetingSchedule({
        scheduledStart: start,
        scheduledEnd: '2026-09-22T17:00:00.000Z',
        now,
        rejectPastStart: false,
      }).ok,
    ).toBe(false);
  });

  it('aceita fim posterior', () => {
    expect(
      validateMeetingSchedule({
        scheduledStart: '2026-09-22T18:00:00.000Z',
        scheduledEnd: '2026-09-22T19:00:00.000Z',
        now,
        rejectPastStart: false,
      }),
    ).toEqual({ ok: true });
  });

  it('rejeita início no passado quando rejectPastStart', () => {
    const result = validateMeetingSchedule({
      scheduledStart: '2026-09-20T10:00:00.000Z',
      now,
      rejectPastStart: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/passado/);
  });

  it('assertMeetingSchedule lança em erro', () => {
    expect(() =>
      assertMeetingSchedule(
        new Date('2026-09-22T18:00:00.000Z'),
        new Date('2026-09-22T17:00:00.000Z'),
      ),
    ).toThrow(/posterior/);
  });
});
