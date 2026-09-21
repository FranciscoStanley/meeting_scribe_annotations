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
