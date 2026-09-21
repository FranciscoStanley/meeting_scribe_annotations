import { describe, expect, it, vi } from 'vitest';
import { ProcessMeetingAlertsUseCase } from './process-meeting-alerts.use-case';
import { MeetingSessionEntity } from '../../domain/entities/meeting-session.entity';

function session(partial: {
  id: string;
  start: Date;
  alertSentAt?: Date;
}) {
  return MeetingSessionEntity.create({
    id: partial.id,
    title: 'Daily',
    platform: 'MEET',
    scheduledStart: partial.start,
    joinUrl: 'https://meet.google.com/abc-defg-hij',
    alertSentAt: partial.alertSentAt,
  });
}

describe('ProcessMeetingAlertsUseCase', () => {
  it('publica meeting:starting na janela lead/grace', async () => {
    const now = new Date('2026-09-21T15:00:00.000Z');
    const upcoming = session({
      id: 's1',
      start: new Date('2026-09-21T15:02:00.000Z'),
    });

    const sessions = {
      findUpcoming: vi.fn().mockResolvedValue([upcoming]),
      save: vi.fn(async (s: MeetingSessionEntity) => s),
    };
    const events = { publish: vi.fn(), subscribe: vi.fn() };
    const config = {
      get: vi.fn((key: string) => {
        if (key === 'MEETING_ALERT_MINUTES') return '3';
        if (key === 'MEETING_ALERT_GRACE_MINUTES') return '5';
        return undefined;
      }),
    };

    const useCase = new ProcessMeetingAlertsUseCase(
      sessions as never,
      events as never,
      config as never,
    );

    const count = await useCase.execute(now);

    expect(count).toBe(1);
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'meeting:starting',
        payload: expect.objectContaining({
          sessionId: 's1',
          joinUrl: 'https://meet.google.com/abc-defg-hij',
          startsInMinutes: 2,
        }),
      }),
    );
    expect(sessions.save).toHaveBeenCalled();
  });

  it('não reenvia alerta se alertSentAt já existir', async () => {
    const now = new Date('2026-09-21T15:00:00.000Z');
    const upcoming = session({
      id: 's2',
      start: new Date('2026-09-21T15:01:00.000Z'),
      alertSentAt: new Date('2026-09-21T14:59:00.000Z'),
    });

    const sessions = {
      findUpcoming: vi.fn().mockResolvedValue([upcoming]),
      save: vi.fn(),
    };
    const events = { publish: vi.fn(), subscribe: vi.fn() };
    const config = {
      get: vi.fn(() => '3'),
    };

    const useCase = new ProcessMeetingAlertsUseCase(
      sessions as never,
      events as never,
      config as never,
    );

    expect(await useCase.execute(now)).toBe(0);
    expect(events.publish).not.toHaveBeenCalled();
  });
});
