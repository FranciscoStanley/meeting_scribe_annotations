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
});
