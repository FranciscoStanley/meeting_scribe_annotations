import { describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { MeetingSessionEntity } from '../../domain/entities/meeting-session.entity';
import { ExpirePastMeetingsUseCase } from './expire-past-meetings.use-case';

function session(partial: {
  start: Date;
  end?: Date;
  status?: 'SCHEDULED' | 'LIVE';
}) {
  let entity = MeetingSessionEntity.create({
    title: 'Past',
    platform: 'MEET',
    scheduledStart: partial.start,
    scheduledEnd: partial.end,
    joinUrl: 'https://meet.google.com/abc-defg-hij',
  });
  if (partial.status === 'LIVE') {
    entity = entity.startLive(partial.start);
  }
  return entity;
}

describe('ExpirePastMeetingsUseCase', () => {
  it('marca COMPLETED agendas cujo fim já passou', async () => {
    const past = session({
      start: new Date('2026-09-20T10:00:00.000Z'),
      end: new Date('2026-09-20T11:00:00.000Z'),
    });
    const future = session({
      start: new Date('2026-09-25T10:00:00.000Z'),
      end: new Date('2026-09-25T11:00:00.000Z'),
    });

    const saved: MeetingSessionEntity[] = [];
    const repo = {
      findOpen: vi.fn().mockResolvedValue([past, future]),
      save: vi.fn(async (s: MeetingSessionEntity) => {
        saved.push(s);
        return s;
      }),
    };
    const config = {
      get: vi.fn().mockReturnValue('60'),
    } as unknown as ConfigService;

    const useCase = new ExpirePastMeetingsUseCase(repo as never, config);
    const now = new Date('2026-09-22T12:00:00.000Z');
    const closed = await useCase.execute(now);

    expect(closed).toBe(1);
    expect(saved).toHaveLength(1);
    expect(saved[0].status).toBe('COMPLETED');
  });

  it('expireIfNeeded não altera sessão ainda na janela', async () => {
    const live = session({
      start: new Date('2026-09-22T10:00:00.000Z'),
      end: new Date('2026-09-22T11:00:00.000Z'),
      status: 'LIVE',
    });
    const repo = {
      findOpen: vi.fn(),
      save: vi.fn(),
    };
    const config = {
      get: vi.fn().mockReturnValue('60'),
    } as unknown as ConfigService;

    const useCase = new ExpirePastMeetingsUseCase(repo as never, config);
    const result = await useCase.expireIfNeeded(
      live,
      new Date('2026-09-22T10:30:00.000Z'),
    );
    expect(result.status).toBe('LIVE');
    expect(repo.save).not.toHaveBeenCalled();
  });
});
