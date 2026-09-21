import { describe, expect, it } from 'vitest';
import { MeetingSessionEntity } from './meeting-session.entity';

describe('MeetingSessionEntity.shouldAlert', () => {
  const base = {
    title: 'Daily',
    platform: 'TEAMS' as const,
    scheduledStart: new Date('2026-09-22T18:00:00.000Z'),
    joinUrl: 'https://teams.microsoft.com/meet/123',
  };

  it('alerta dentro da janela de lead (ex.: 3 min antes)', () => {
    const session = MeetingSessionEntity.create(base);
    const now = new Date('2026-09-22T17:58:00.000Z');
    expect(session.shouldAlert(now, 3, 5)).toBe(true);
  });

  it('alerta se o cron atrasou poucos minutos após o início', () => {
    const session = MeetingSessionEntity.create(base);
    const now = new Date('2026-09-22T18:02:00.000Z');
    expect(session.shouldAlert(now, 3, 5)).toBe(true);
  });

  it('não alerta muito antes', () => {
    const session = MeetingSessionEntity.create(base);
    const now = new Date('2026-09-22T17:00:00.000Z');
    expect(session.shouldAlert(now, 3, 5)).toBe(false);
  });

  it('não alerta duas vezes', () => {
    const session = MeetingSessionEntity.create(base).markAlertSent(
      new Date('2026-09-22T17:57:00.000Z'),
    );
    const now = new Date('2026-09-22T17:58:00.000Z');
    expect(session.shouldAlert(now, 3, 5)).toBe(false);
  });

  it('permite editar/excluir só antes de iniciar (SCHEDULED / AWAITING_JOIN)', () => {
    const scheduled = MeetingSessionEntity.create(base);
    expect(scheduled.canModify()).toBe(true);
    expect(scheduled.markAlertSent(new Date()).canModify()).toBe(true);
    expect(scheduled.startLive(new Date()).canModify()).toBe(false);
    expect(scheduled.complete(new Date()).canModify()).toBe(false);
  });

  it('updateSchedule limpa alerta e volta a SCHEDULED', () => {
    const session = MeetingSessionEntity.create(base).markAlertSent(new Date());
    const updated = session.updateSchedule({
      title: 'Daily 2',
      scheduledStart: new Date('2026-09-22T19:00:00.000Z'),
      joinUrl: 'https://meet.google.com/abc-defg-hij',
      platform: 'MEET',
    });
    expect(updated.title).toBe('Daily 2');
    expect(updated.status).toBe('SCHEDULED');
    expect(updated.alertSentAt).toBeUndefined();
    expect(updated.platform).toBe('MEET');
  });
});

describe('MeetingSessionEntity.shouldAutoComplete', () => {
  const base = {
    title: 'Daily',
    platform: 'TEAMS' as const,
    scheduledStart: new Date('2026-09-22T18:00:00.000Z'),
    scheduledEnd: new Date('2026-09-22T19:00:00.000Z'),
    joinUrl: 'https://teams.microsoft.com/meet/123',
  };

  it('não encerra antes do início', () => {
    const session = MeetingSessionEntity.create(base);
    expect(
      session.shouldAutoComplete(new Date('2026-09-22T17:59:00.000Z')),
    ).toBe(false);
  });

  it('não encerra entre início e fim', () => {
    const session = MeetingSessionEntity.create(base);
    expect(
      session.shouldAutoComplete(new Date('2026-09-22T18:30:00.000Z')),
    ).toBe(false);
  });

  it('encerra quando início e fim já passaram', () => {
    const session = MeetingSessionEntity.create(base);
    expect(
      session.shouldAutoComplete(new Date('2026-09-22T19:00:00.000Z')),
    ).toBe(true);
  });

  it('sem fim usa duração padrão a partir do início', () => {
    const session = MeetingSessionEntity.create({
      ...base,
      scheduledEnd: undefined,
    });
    expect(
      session.shouldAutoComplete(new Date('2026-09-22T18:59:00.000Z'), 60),
    ).toBe(false);
    expect(
      session.shouldAutoComplete(new Date('2026-09-22T19:00:00.000Z'), 60),
    ).toBe(true);
  });

  it('não encerra COMPLETED ou CANCELLED', () => {
    const done = MeetingSessionEntity.create(base).complete(
      new Date('2026-09-22T19:00:00.000Z'),
    );
    expect(
      done.shouldAutoComplete(new Date('2026-09-22T20:00:00.000Z')),
    ).toBe(false);
  });
});
